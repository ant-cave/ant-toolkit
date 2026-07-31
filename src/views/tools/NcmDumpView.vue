<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// NCM 解锁工具：批量上传 .ncm 文件排队转换，实时显示进度与日志（需登录）
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

// 待上传文件
const fileInput = ref(null)
const isDragover = ref(false)
const files = ref([])
const submitting = ref(false)
const submitErrors = ref([])

// 任务列表
const jobs = ref([])
const logOpen = ref(new Set())
const downloaded = ref(new Set())
const error = ref('')

let pollTimer = null

// ===== 文件选择 =====

function pickNcm(list) {
  return [...list].filter((f) => f.name.toLowerCase().endsWith('.ncm'))
}

function onDrop(e) {
  isDragover.value = false
  const picked = pickNcm(e.dataTransfer.files)
  if (picked.length) {
    files.value = [...files.value, ...picked]
    error.value = ''
  }
}

function onFileChange(e) {
  const picked = pickNcm(e.target.files)
  if (picked.length) files.value = [...files.value, ...picked]
  e.target.value = ''
}

function removeFile(i) {
  files.value.splice(i, 1)
}

function clearFiles() {
  files.value = []
  error.value = ''
}

function formatSize(b) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(2) + ' MB'
}

// ===== 提交与轮询 =====

async function submit() {
  error.value = ''
  submitErrors.value = []
  if (!files.value.length) return
  submitting.value = true
  try {
    const fd = new FormData()
    for (const f of files.value) fd.append('files', f)
    const res = await fetch('/api/ncmdump/jobs', { method: 'POST', body: fd, credentials: 'include' })
    if (res.status === 401) {
      error.value = '登录已过期，请重新登录'
      return
    }
    if (!res.ok) {
      error.value = '提交失败（' + res.status + '）'
      return
    }
    const data = await res.json()
    submitErrors.value = data.errors || []
    if (data.jobs && data.jobs.length) {
      // 新任务插入到队列列表最前
      jobs.value = [...data.jobs.map((j) => ({ ...j, progress: 0 })), ...jobs.value]
      await refresh()
      startPolling()
    }
    files.value = []
  } catch (e) {
    error.value = '提交失败：' + e.message
  } finally {
    submitting.value = false
  }
}

async function refresh() {
  try {
    const res = await fetch('/api/ncmdump/jobs', { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    // 按 id 合并，保持后端返回顺序
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
  // 回到页面时恢复进行中的任务
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

async function downloadJob(job) {
  if (downloaded.value.has(job.id)) return
  try {
    const res = await fetch(job.download_url, { credentials: 'include' })
    if (!res.ok) {
      error.value = '下载失败，请刷新任务列表重试'
      await refresh()
      return
    }
    const blob = await res.blob()
    const cd = res.headers.get('Content-Disposition') || ''
    const unicode = cd.match(/filename\*=UTF-8''([^;]+)/i)
    const ascii = cd.match(/filename="([^"]+)"/i)
    const name = unicode ? decodeURIComponent(unicode[1]) : ascii ? ascii[1] : job.result_filename || 'output'
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    downloaded.value.add(job.id)
  } catch (e) {
    error.value = '下载失败：' + e.message
  }
}

function canDownload(job) {
  return job.status === 'done' && job.download_url && !downloaded.value.has(job.id)
}
</script>

<template>
  <ToolPage title="NCM 解锁" subtitle="批量 .ncm 转通用格式，排队转换（需登录）">
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
          <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">支持批量排队转换，单文件上限 200MB</p>
        </template>
        <template v-else>
          <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">已选择 {{ files.length }} 个文件</p>
          <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">再次点击可继续添加</p>
        </template>
      </div>

      <!-- 已选文件列表 -->
      <div v-if="files.length" class="rounded-sm border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
        <div
          v-for="(f, i) in files"
          :key="i"
          class="flex items-center gap-2 px-1 py-1.5"
        >
          <IconMusic class="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
          <span class="min-w-0 flex-1 truncate text-sm text-neutral-800 dark:text-neutral-200" :title="f.name">{{ f.name }}</span>
          <span class="shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-500">{{ formatSize(f.size) }}</span>
          <button
            class="shrink-0 rounded-sm p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            :title="'移除 ' + f.name"
            @click.stop="removeFile(i)"
          >
            <IconTrash class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="files.length" class="flex items-center gap-2">
        <button
          class="flex-1 rounded-sm bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? '提交中...' : '开始转换（' + files.length + ' 个）' }}
        </button>
        <button
          class="inline-flex items-center gap-1 rounded-sm border border-neutral-300 px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
          @click="clearFiles"
        >
          <IconTrash class="h-4 w-4" /> 清空
        </button>
      </div>

      <!-- 全局提示 -->
      <p v-if="error" class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
        {{ error }}
      </p>
      <p
        v-if="submitErrors.length"
        class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        有 {{ submitErrors.length }} 个文件未加入队列：
        <span v-for="(e, i) in submitErrors" :key="i">「{{ e.filename }}」{{ e.reason }}；</span>
      </p>

      <!-- 任务队列 -->
      <div v-if="jobs.length" class="space-y-3">
        <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">转换队列</span>
            <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {{ doneCount }} / {{ jobs.length }}
              <span v-if="activeCount">（还有 {{ activeCount }} 个在处理）</span>
            </span>
          </div>
          <!-- 总体进度条 -->
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
            <span class="shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-500">{{ formatSize(job.size || 0) }}</span>
            <span class="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
              {{ statusMeta[job.status] ? statusMeta[job.status].label : job.status }}
            </span>

            <!-- 操作 -->
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
