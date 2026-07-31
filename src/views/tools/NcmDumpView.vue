<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// NCM 解锁工具：批量 .ncm 分片上传（5MB/片）+ 排队转换 + 进度与日志（需登录）
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRequestStore } from '../../stores/request'
import ToolPage from '../../components/tools/ToolPage.vue'
import IconNetease from '~icons/tabler/brand-netease-music'
import IconLock from '~icons/tabler/lock'
import IconMusic from '~icons/tabler/music'
import IconTrash from '~icons/tabler/trash'
import IconDownload from '~icons/tabler/download'
import IconLoader from '~icons/tabler/loader-2'
import IconCheck from '~icons/tabler/circle-check'
import IconError from '~icons/tabler/circle-x'
import IconBan from '~icons/tabler/ban'
import IconClock from '~icons/tabler/clock'
import IconChevronDown from '~icons/tabler/chevron-down'
import IconChevronUp from '~icons/tabler/chevron-up'

const store = useRequestStore()

// ncm 魔数 CTENFDAM，用于选择时本地校验
const NCM_MAGIC = [0x43, 0x54, 0x45, 0x4e, 0x46, 0x44, 0x41, 0x4d]
// 分片大小：5MB（低于常见 nginx 上传上限，绕开 413）
const CHUNK_SIZE = 5 * 1024 * 1024

// 待上传文件列表 [{ id, file, size }]
const fileInput = ref(null)
const files = ref([])
const isDragover = ref(false)
const submitting = ref(false)
const submitErrors = ref([])
// 上传进度：id -> { current, total }
const uploadMap = ref({})

// 任务列表
const jobs = ref([])
const logOpen = ref(new Set())
const downloaded = ref(new Set())
const error = ref('')

let pollTimer = null
let uidSeq = 0

function uid() {
  uidSeq += 1
  return Date.now().toString(36) + '-' + uidSeq
}

function formatSize(b) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(2) + ' MB'
}

// ===== 文件选择（带魔数校验）=====

function readMagic(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result))
    reader.onerror = () => resolve(null)
    reader.readAsArrayBuffer(file.slice(0, 8))
  })
}

async function addFiles(list) {
  const invalid = []
  const added = []
  for (const f of [...list]) {
    if (!f.name.toLowerCase().endsWith('.ncm')) {
      invalid.push({ name: f.name, reason: '仅支持 .ncm 文件' })
      continue
    }
    const bytes = await readMagic(f)
    if (!bytes || bytes.length !== NCM_MAGIC.length || !NCM_MAGIC.every((b, i) => bytes[i] === b)) {
      invalid.push({ name: f.name, reason: '不是有效的 .ncm 文件' })
      continue
    }
    added.push({ id: uid(), file: f, size: f.size })
  }
  if (added.length) {
    files.value = [...files.value, ...added]
    error.value = ''
  }
  if (invalid.length) submitErrors.value = [...submitErrors.value, ...invalid]
}

function onDrop(e) {
  isDragover.value = false
  addFiles(e.dataTransfer.files)
}

function onFileChange(e) {
  addFiles(e.target.files)
  e.target.value = ''
}

function removeFile(item) {
  files.value = files.value.filter((x) => x.id !== item.id)
}

function clearFiles() {
  files.value = []
  error.value = ''
}

// ===== 分片上传 =====

function setUploadProgress(id, current, total) {
  uploadMap.value = { ...uploadMap.value, [id]: { current, total } }
}

function clearUploadProgress(id) {
  const m = { ...uploadMap.value }
  delete m[id]
  uploadMap.value = m
}

async function uploadChunk(uploadId, index, blob, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const fd = new FormData()
      fd.append('index', String(index))
      fd.append('chunk', blob, 'chunk.bin')
      const res = await fetch(`/api/ncmdump/upload/${uploadId}/chunk`, { method: 'POST', body: fd, credentials: 'include' })
      if (res.ok) return true
    } catch { /* 网络异常，重试 */ }
    if (attempt < retries) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
  }
  return false
}

// 并发上传的 worker 池：最多 limit 个文件同时上传，任一个完成即进队列转换
async function mapLimit(items, limit, fn) {
  let i = 0
  const results = []
  async function worker() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx])
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

async function uploadOne(item) {
  // 1. 初始化上传会话
  let res = await fetch('/api/ncmdump/upload/init', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: item.file.name, size: item.size, chunk_size: CHUNK_SIZE })
  })
  if (res.status === 401) {
    error.value = '登录已过期，请重新登录'
    return
  }
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    submitErrors.value.push({ name: item.file.name, reason: d.detail || ('初始化失败 ' + res.status) })
    removeFile(item)
    return
  }
  const { upload_id: uploadId, chunk_size: chunkSize, total_chunks: totalChunks } = await res.json()

  // 2. 逐片上传（带重试）
  for (let n = 0; n < totalChunks; n++) {
    const start = n * chunkSize
    const blob = item.file.slice(start, Math.min(start + chunkSize, item.size))
    if (!(await uploadChunk(uploadId, n, blob))) {
      error.value = '上传失败：' + item.file.name
      // 清理服务端残留分片
      fetch(`/api/ncmdump/upload/${uploadId}`, { method: 'DELETE', credentials: 'include' }).catch(() => {})
      return
    }
    setUploadProgress(item.id, n + 1, totalChunks)
  }

  // 3. 合并并加入队列（上传完成即触发轮询，转换与其它文件上传互不影响）
  res = await fetch(`/api/ncmdump/upload/${uploadId}/complete`, { method: 'POST', credentials: 'include' })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    submitErrors.value.push({ name: item.file.name, reason: d.detail || ('提交失败 ' + res.status) })
    removeFile(item)
    clearUploadProgress(item.id)
    return
  }
  const data = await res.json()
  jobs.value = [{ id: data.job_id, filename: data.filename, status: 'pending', progress: 0, size: item.size }, ...jobs.value]
  removeFile(item)
  clearUploadProgress(item.id)
  startPolling()
}

async function submit() {
  error.value = ''
  submitErrors.value = []
  if (!files.value.length) return
  submitting.value = true
  const queue = [...files.value] // 快照，避免上传过程中列表变化影响遍历

  try {
    // 最多 3 个文件并发上传，任一完成立即进入转换队列
    await mapLimit(queue, 3, uploadOne)
    await refresh()
    if (activeCount.value) startPolling()
  } catch (e) {
    error.value = '上传失败：' + e.message
  } finally {
    submitting.value = false
  }
}

// ===== 打包下载 =====

async function downloadArchive() {
  try {
    const res = await fetch('/api/ncmdump/archive.zip', { credentials: 'include' })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      error.value = d.detail || ('打包失败 ' + res.status)
      return
    }
    const blob = await res.blob()
    triggerDownload(blob, 'ncm_outputs.zip')
  } catch (e) {
    error.value = '打包失败：' + e.message
  }
}

// ===== 任务轮询 =====

async function refresh() {
  try {
    const res = await fetch('/api/ncmdump/jobs', { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    const byId = new Map(jobs.value.map((j) => [j.id, j]))
    for (const job of data.jobs || []) byId.set(job.id, job)
    jobs.value = (data.jobs || []).map((j) => byId.get(j.id))
    if (!activeCount.value) stopPolling()
  } catch { /* 轮询失败静默，下次重试 */ }
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(refresh, 1500)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  refresh()
})

onBeforeUnmount(() => stopPolling())

// ===== 任务状态 =====

const activeCount = computed(() => jobs.value.filter((j) => j.status === 'pending' || j.status === 'running').length)
const doneCount = computed(() => jobs.value.filter((j) => ['done', 'error', 'cancelled'].includes(j.status)).length)
const progressPct = computed(() => (jobs.value.length ? Math.round((doneCount.value / jobs.value.length) * 100) : 0))

const statusMeta = {
  pending: { label: '排队中', icon: IconClock },
  running: { label: '转换中', icon: IconLoader },
  done: { label: '完成', icon: IconCheck },
  error: { label: '失败', icon: IconError },
  cancelled: { label: '已取消', icon: IconBan }
}

function toggleLog(job) {
  const set = new Set(logOpen.value)
  if (set.has(job.id)) set.delete(job.id)
  else set.add(job.id)
  logOpen.value = set
}

async function cancelJob(job) {
  try {
    await fetch(`/api/ncmdump/jobs/${job.id}/cancel`, { method: 'POST', credentials: 'include' })
    await refresh()
  } catch { /* 忽略 */ }
}

// 触发下载并延迟释放 blob URL（立即 revoke 会导致大文件下载被浏览器中断）
function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

async function downloadJob(job) {
  if (downloaded.value.has(job.id)) return
  try {
    const res = await fetch(job.download_url, { credentials: 'include' })
    if (!res.ok) {
      error.value = '结果已过期（保留 1 小时），请重新转换'
      await refresh()
      return
    }
    const blob = await res.blob()
    const cd = res.headers.get('Content-Disposition') || ''
    const unicode = cd.match(/filename\*=UTF-8''([^;]+)/i)
    const ascii = cd.match(/filename="([^"]+)"/i)
    const name = unicode ? decodeURIComponent(unicode[1]) : ascii ? ascii[1] : job.result_filename || 'output'
    triggerDownload(blob, name)
    downloaded.value.add(job.id)
  } catch (e) {
    error.value = '下载失败：' + e.message
  }
}

function canDownload(job) {
  return job.status === 'done' && job.download_url && !downloaded.value.has(job.id)
}

// 输出格式（flac / mp3 / ogg）
function formatOf(job) {
  const m = /\.([a-z0-9]+)$/i.exec(job.result_filename || '')
  return m ? m[1].toUpperCase() : ''
}
</script>

<template>
  <ToolPage title="NCM 解锁" subtitle="批量 .ncm 转通用格式，分片上传排队转换（需登录）">
    <!-- 登录态检查中 -->
    <div v-if="store.authLoading" class="rounded-sm border border-neutral-200 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <p class="text-sm text-neutral-400 dark:text-neutral-500">检查登录...</p>
    </div>

    <!-- 未登录 -->
    <div v-else-if="!store.user" class="rounded-sm border border-neutral-200 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <IconLock class="mx-auto mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
      <p class="text-sm text-neutral-600 dark:text-neutral-400">使用该工具需要登录</p>
      <button
        class="mt-4 rounded-sm bg-neutral-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        @click="store.login()"
      >
        立即登录
      </button>
    </div>

    <!-- 已登录 -->
    <template v-else>
      <!-- 上传区 -->
      <div
        class="cursor-pointer rounded-sm border-2 border-dashed border-neutral-300 bg-white p-8 text-center transition-colors dark:border-neutral-600 dark:bg-neutral-900 sm:p-10"
        :class="{ 'border-neutral-500 bg-neutral-50 dark:bg-neutral-800': isDragover, 'border-neutral-400': files.length > 0 }"
        @dragover.prevent="isDragover = true"
        @dragleave="isDragover = false"
        @drop.prevent="onDrop"
        @click="fileInput.click()"
      >
        <input ref="fileInput" type="file" accept=".ncm" multiple class="hidden" @change="onFileChange" />
        <template v-if="files.length === 0">
          <IconNetease class="mx-auto mb-3 h-10 w-10 text-neutral-400 dark:text-neutral-500" />
          <p class="text-sm text-neutral-600 dark:text-neutral-400">拖拽多个 .ncm 文件到此处，或点击选择</p>
          <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">支持批量排队转换，5MB 分片上传，单文件上限 200MB</p>
        </template>
        <template v-else>
          <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">已选择 {{ files.length }} 个文件</p>
          <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">再次点击可继续添加</p>
        </template>
      </div>

      <!-- 已选文件列表（含上传进度） -->
      <div v-if="files.length" class="rounded-sm border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
        <div v-for="item in files" :key="item.id" class="px-1 py-1.5">
          <div class="flex items-center gap-2">
            <IconMusic class="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
            <span class="min-w-0 flex-1 truncate text-sm text-neutral-800 dark:text-neutral-200" :title="item.file.name">{{ item.file.name }}</span>
            <span class="shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-500">{{ formatSize(item.size) }}</span>
            <!-- 上传中：进度；否则：移除 -->
            <template v-if="submitting">
              <span class="shrink-0 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {{ uploadMap[item.id] ? uploadMap[item.id].current + '/' + uploadMap[item.id].total : '...' }}
              </span>
            </template>
            <button
              v-else
              class="shrink-0 rounded-sm p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              :title="'移除 ' + item.file.name"
              @click.stop="removeFile(item)"
            >
              <IconTrash class="h-4 w-4" />
            </button>
          </div>
          <!-- 上传进度条 -->
          <div v-if="submitting && uploadMap[item.id]" class="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              class="h-full rounded-full bg-neutral-900 transition-all duration-300 dark:bg-neutral-100"
              :style="{ width: Math.round((uploadMap[item.id].current / uploadMap[item.id].total) * 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="files.length && !submitting" class="flex items-center gap-2">
        <button
          class="flex-1 rounded-sm bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          @click="submit"
        >
          开始转换（{{ files.length }} 个）
        </button>
        <button
          class="inline-flex items-center gap-1 rounded-sm border border-neutral-300 px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
          @click="clearFiles"
        >
          <IconTrash class="h-4 w-4" /> 清空
        </button>
      </div>
      <p v-else-if="submitting" class="text-center text-xs text-neutral-400 dark:text-neutral-500">分片上传中，完成后自动进入转换队列...</p>

      <!-- 全局提示 -->
      <p v-if="error" class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
        {{ error }}
      </p>
      <p
        v-if="submitErrors.length"
        class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        有 {{ submitErrors.length }} 个文件未加入队列：
        <span v-for="(e, i) in submitErrors" :key="i">「{{ e.name }}」{{ e.reason }}；</span>
      </p>

      <!-- 任务队列 -->
      <div v-if="jobs.length" class="space-y-3">
        <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">转换队列</span>
            <div class="flex items-center gap-2">
              <button
                v-if="doneCount > 0"
                class="inline-flex items-center gap-1 rounded-sm border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
                @click="downloadArchive"
              >
                <IconDownload class="h-3.5 w-3.5" /> 打包下载 ZIP
              </button>
              <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {{ doneCount }} / {{ jobs.length }}
                <span v-if="activeCount">（还有 {{ activeCount }} 个在处理）</span>
              </span>
            </div>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              class="h-full rounded-full bg-neutral-900 transition-all duration-500 dark:bg-neutral-100"
              :style="{ width: progressPct + '%' }"
            ></div>
          </div>
        </div>

        <!-- 单个任务 -->
        <div
          v-for="job in jobs"
          :key="job.id"
          class="rounded-sm border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div class="flex items-center gap-2">
            <component
              :is="statusMeta[job.status] ? statusMeta[job.status].icon : IconClock"
              class="h-4 w-4 shrink-0"
              :class="{
                'animate-spin text-neutral-900 dark:text-neutral-100': job.status === 'running',
                'text-neutral-400 dark:text-neutral-500': job.status === 'pending' || job.status === 'cancelled',
                'text-neutral-900 dark:text-neutral-100': job.status === 'done',
                'text-neutral-500 dark:text-neutral-400': job.status === 'error'
              }"
            />
            <span class="min-w-0 flex-1 truncate text-sm text-neutral-800 dark:text-neutral-200" :title="job.filename">{{ job.filename }}</span>
            <!-- 输出格式徽标 -->
            <span
              v-if="job.status === 'done' && formatOf(job)"
              class="shrink-0 rounded-sm border border-neutral-300 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
            >
              {{ formatOf(job) }}
            </span>
            <span class="shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-500">{{ formatSize(job.size || 0) }}</span>
            <span class="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
              {{ statusMeta[job.status] ? statusMeta[job.status].label : job.status }}
            </span>

            <button
              v-if="canDownload(job)"
              class="inline-flex shrink-0 items-center gap-1 rounded-sm border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
              @click="downloadJob(job)"
            >
              <IconDownload class="h-3.5 w-3.5" /> 下载
            </button>
            <button
              v-if="job.status === 'pending'"
              class="shrink-0 rounded-sm px-1.5 py-1 text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
              title="取消排队"
              @click="cancelJob(job)"
            >
              取消
            </button>
            <button
              v-if="job.log || job.error"
              class="shrink-0 rounded-sm p-1 text-neutral-400 transition-colors hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
              :title="logOpen.has(job.id) ? '收起日志' : '查看日志'"
              @click="toggleLog(job)"
            >
              <IconChevronUp v-if="logOpen.has(job.id)" class="h-4 w-4" />
              <IconChevronDown v-else class="h-4 w-4" />
            </button>
          </div>

          <!-- 进度条 -->
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              v-if="job.status === 'running'"
              class="indeterminate h-full w-1/3 rounded-full"
            ></div>
            <div
              v-else
              class="h-full rounded-full transition-all duration-500"
              :class="job.status === 'error' || job.status === 'cancelled' ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-neutral-900 dark:bg-neutral-100'"
              :style="{ width: (job.status === 'done' ? 100 : 0) + '%' }"
            ></div>
          </div>

          <!-- 错误信息 -->
          <p v-if="job.error" class="mt-2 break-all rounded-sm bg-neutral-100 px-2.5 py-1.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {{ job.error }}
          </p>

          <!-- 日志 -->
          <div v-if="logOpen.has(job.id) && (job.log || job.error)" class="mt-2">
            <pre class="max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-sm border border-neutral-200 bg-neutral-950 p-3 font-mono text-xs leading-relaxed text-neutral-300 dark:border-neutral-800">{{ job.log || '（无输出）' }}</pre>
          </div>
        </div>
      </div>
    </template>
  </ToolPage>
</template>

<style scoped>
/* 转换中不定进度条动画 */
.indeterminate {
  background: linear-gradient(90deg, transparent 0%, #525252 50%, transparent 100%);
  background-size: 200% 100%;
  animation: ncm-slide 1.2s infinite linear;
}
@keyframes ncm-slide {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
.dark .indeterminate {
  background: linear-gradient(90deg, transparent 0%, #d4d4d4 50%, transparent 100%);
  background-size: 200% 100%;
}
</style>
