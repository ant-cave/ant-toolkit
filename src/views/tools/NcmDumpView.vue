<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// NCM 解锁工具：纯前端解密（ncmdump-js），文件不上传、无需登录
// 支持批量解密、元数据/封面展示、单个下载与 zip 打包下载
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import IconNetease from '~icons/tabler/brand-netease-music'
import IconMusic from '~icons/tabler/music'
import IconTrash from '~icons/tabler/trash'
import IconDownload from '~icons/tabler/download'
import IconLoader from '~icons/tabler/loader-2'
import IconCheck from '~icons/tabler/circle-check'
import IconError from '~icons/tabler/circle-x'
import JSZip from 'jszip'
import { dump } from 'ncmdump-js'

// 待处理文件
const fileInput = ref(null)
const isDragover = ref(false)
const files = ref([])          // [{ id, file }]
// 处理结果：id -> { status, result, error, coverUrl }
const items = ref({})
const processing = ref(false)

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

// ===== 文件选择 =====

function addFiles(list) {
  const picked = [...list].filter((f) => f.name.toLowerCase().endsWith('.ncm'))
  if (!picked.length) return
  for (const f of picked) files.value.push({ id: uid(), file: f })
  error.value = ''
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
  const state = items.value[item.id]
  if (state && state.coverUrl) URL.revokeObjectURL(state.coverUrl)
  delete items.value[item.id]
  files.value = files.value.filter((x) => x.id !== item.id)
}

function clearAll() {
  for (const st of Object.values(items.value)) {
    if (st.coverUrl) URL.revokeObjectURL(st.coverUrl)
  }
  items.value = {}
  files.value = []
  error.value = ''
}

const error = ref('')

// ===== 解密 =====

function updateItem(id, patch) {
  items.value = { ...items.value, [id]: { ...(items.value[id] || {}), ...patch } }
}

function coverUrl(image) {
  if (!image) return ''
  // 尝试从字节判断图片类型
  let type = 'image/jpeg'
  if (image[0] === 0x89 && image[1] === 0x50) type = 'image/png'
  else if (image[0] === 0x47 && image[1] === 0x49) type = 'image/gif'
  return URL.createObjectURL(new Blob([image], { type }))
}

function artistText(metadata) {
  if (!metadata) return ''
  if (typeof metadata.artistName === 'string') return metadata.artistName
  if (Array.isArray(metadata.artist)) {
    return metadata.artist.map((a) => (Array.isArray(a) ? a[0] : a)).join(' / ')
  }
  return ''
}

async function processAll() {
  error.value = ''
  if (!files.value.length) return
  processing.value = true
  const queue = [...files.value]
  let done = 0

  for (const item of queue) {
    updateItem(item.id, { status: 'working', progress: done, total: queue.length })
    try {
      const result = await dump(item.file)
      updateItem(item.id, {
        status: 'done',
        progress: queue.length,
        total: queue.length,
        result,
        coverUrl: result.image ? coverUrl(result.image) : '',
      })
    } catch (e) {
      updateItem(item.id, { status: 'error', progress: queue.length, total: queue.length, error: e.message || '解密失败' })
    }
    done += 1
    // 同步剩余任务进度
    for (const rest of queue.slice(done)) {
      updateItem(rest.id, { progress: done, total: queue.length })
    }
  }

  processing.value = false
}

// 整体进度
const progressPct = computed(() => {
  if (!files.value.length) return 0
  const total = files.value.length
  const doneCount = files.value.filter((x) => items.value[x.id] && items.value[x.id].status !== undefined).length
  return Math.round((doneCount / total) * 100)
})
const doneCount = computed(() => files.value.filter((x) => items.value[x.id] && ['done', 'error'].includes(items.value[x.id].status)).length)

// ===== 下载 =====

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function downloadOne(item) {
  const st = items.value[item.id]
  if (st && st.status === 'done' && st.result) {
    downloadBlob(st.result.blob, st.result.filename)
  }
}

async function downloadZip() {
  const done = files.value
    .map((x) => items.value[x.id])
    .filter((st) => st && st.status === 'done' && st.result)
  if (!done.length) return
  try {
    const zip = new JSZip()
    for (const st of done) {
      zip.file(st.result.filename, st.result.blob)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'ncm_outputs.zip')
  } catch (e) {
    error.value = '打包失败：' + e.message
  }
}
</script>

<template>
  <ToolPage title="NCM 解锁" subtitle="纯前端解密 .ncm 音乐，文件不上传、无需登录">
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
        <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">解密全程在本地浏览器完成，不会上传任何文件</p>
      </template>
      <template v-else>
        <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">已选择 {{ files.length }} 个文件</p>
        <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">再次点击可继续添加</p>
      </template>
    </div>

    <!-- 操作按钮 -->
    <div v-if="files.length && !processing" class="flex items-center gap-2">
      <button
        class="flex-1 rounded-sm bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        @click="processAll"
      >
        开始解密（{{ files.length }} 个）
      </button>
      <button
        class="inline-flex items-center gap-1 rounded-sm border border-neutral-300 px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
        @click="clearAll"
      >
        <IconTrash class="h-4 w-4" /> 清空
      </button>
    </div>

    <p v-if="processing" class="text-center text-xs text-neutral-400 dark:text-neutral-500">
      解密中 {{ doneCount }} / {{ files.length }}...
    </p>
    <p v-if="error" class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
      {{ error }}
    </p>

    <!-- 文件 / 结果列表 -->
    <div v-if="files.length" class="rounded-sm border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
      <div v-for="item in files" :key="item.id" class="border-b border-neutral-100 px-1 py-2.5 last:border-b-0 dark:border-neutral-800">
        <!-- 顶部行：文件名 + 状态 + 操作 -->
        <div class="flex items-center gap-2">
          <IconMusic class="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
          <span class="min-w-0 flex-1 truncate text-sm text-neutral-800 dark:text-neutral-200" :title="item.file.name">{{ item.file.name }}</span>
          <span class="shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-500">{{ formatSize(item.file.size) }}</span>

          <!-- 状态 -->
          <span v-if="!items[item.id]" class="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">待处理</span>
          <span v-else-if="items[item.id].status === 'working'" class="inline-flex shrink-0 items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <IconLoader class="h-3.5 w-3.5 animate-spin" /> 解密中
          </span>
          <span v-else-if="items[item.id].status === 'done'" class="inline-flex shrink-0 items-center gap-1 text-xs text-neutral-700 dark:text-neutral-300">
            <IconCheck class="h-3.5 w-3.5" />
            <span class="rounded-sm border border-neutral-300 px-1.5 py-0.5 font-mono text-[10px] font-semibold dark:border-neutral-600">
              {{ (items[item.id].result.extension || '').toUpperCase() }}
            </span>
          </span>
          <span v-else class="inline-flex shrink-0 items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <IconError class="h-3.5 w-3.5" /> 失败
          </span>

          <!-- 操作 -->
          <template v-if="items[item.id] && items[item.id].status === 'done'">
            <button
              class="inline-flex shrink-0 items-center gap-1 rounded-sm border border-neutral-300 px-2 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
              @click="downloadOne(item)"
            >
              <IconDownload class="h-3.5 w-3.5" /> 下载
            </button>
          </template>
          <button
            v-if="!processing"
            class="shrink-0 rounded-sm p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            :title="'移除 ' + item.file.name"
            @click="removeFile(item)"
          >
            <IconTrash class="h-4 w-4" />
          </button>
        </div>

        <!-- 进度条 -->
        <div v-if="items[item.id] && items[item.id].status === 'working'" class="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            class="h-full rounded-full bg-neutral-900 transition-all duration-300 dark:bg-neutral-100"
            :style="{ width: Math.round(((items[item.id].progress || 0) / (items[item.id].total || 1)) * 100) + '%' }"
          ></div>
        </div>

        <!-- 结果信息 -->
        <div v-if="items[item.id] && items[item.id].status === 'done'" class="mt-2 flex items-center gap-3">
          <div v-if="items[item.id].coverUrl" class="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-800">
            <img :src="items[item.id].coverUrl" alt="封面" class="h-full w-full object-cover" />
          </div>
          <div class="min-w-0">
            <div class="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ items[item.id].result.filename }}</div>
            <div v-if="items[item.id].result.metadata" class="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
              {{ items[item.id].result.metadata.musicName || '' }}<template v-if="artistText(items[item.id].result.metadata)"> · {{ artistText(items[item.id].result.metadata) }}</template><template v-if="items[item.id].result.metadata.album"> · 《{{ items[item.id].result.metadata.album }}》</template>
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <p v-if="items[item.id] && items[item.id].status === 'error'" class="mt-1.5 break-all text-xs text-neutral-500 dark:text-neutral-400">
          {{ items[item.id].error }}
        </p>
      </div>
    </div>

    <!-- 打包下载 -->
    <div v-if="doneCount > 0 && !processing" class="flex items-center gap-2">
      <button
        class="inline-flex items-center gap-1 rounded-sm border border-neutral-300 px-3 py-2 text-sm text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
        @click="downloadZip"
      >
        <IconDownload class="h-4 w-4" /> 打包下载 ZIP（{{ doneCount }} 个）
      </button>
    </div>
  </ToolPage>
</template>
