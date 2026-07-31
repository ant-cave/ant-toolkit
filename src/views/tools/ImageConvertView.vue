<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 图片格式转换工具：PNG / WebP / JPEG 互转，可选质量并支持批量下载
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import IconPhotoPlus from '~icons/tabler/photo-plus'
import IconDownload from '~icons/tabler/download'
import IconFileDownload from '~icons/tabler/file-download'
import IconArrowRight from '~icons/tabler/arrow-right'

const fileInput = ref(null)
const isDragover = ref(false)
const files = ref([])
// 目标格式与质量
const format = ref('webp')
const quality = ref(90)
const converting = ref(false)
const results = ref([])

const formats = [
  { value: 'png', label: 'PNG', type: 'image/png', ext: 'png' },
  { value: 'webp', label: 'WebP', type: 'image/webp', ext: 'webp' },
  { value: 'jpeg', label: 'JPEG', type: 'image/jpeg', ext: 'jpg' }
]

// 当前格式是否支持质量调节（PNG 无损无质量参数）
const showQuality = computed(() => format.value !== 'png')

function onDrop(e) {
  isDragover.value = false
  const dropped = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'))
  if (dropped.length) files.value = [...files.value, ...dropped]
}

function onFileChange(e) {
  const selected = [...e.target.files].filter((f) => f.type.startsWith('image/'))
  if (selected.length) files.value = [...files.value, ...selected]
  e.target.value = ''
}

async function convert() {
  if (!files.value.length) return
  converting.value = true
  results.value = []
  const target = formats.find((f) => f.value === format.value)

  for (const file of files.value) {
    try {
      const blob = await convertImage(file, target.type, target.value === 'png' ? undefined : quality.value / 100)
      const ratio = ((1 - blob.size / file.size) * 100).toFixed(1)
      results.value.push({
        name: file.name.replace(/\.[^.]+$/, '') + '.' + target.ext,
        url: URL.createObjectURL(blob),
        blob,
        originalSize: file.size,
        convertedSize: blob.size,
        ratio: Number(ratio)
      })
    } catch {
      // 跳过转换失败的文件
    }
  }

  converting.value = false
}

function convertImage(file, mime, q) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      // 转 JPEG 时先填充白底，避免透明区域变黑
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('转换失败'))),
        mime,
        q
      )
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = URL.createObjectURL(file)
  })
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}

function downloadSingle(r) {
  const a = document.createElement('a')
  a.href = r.url
  a.download = r.name
  a.click()
}

function downloadAll() {
  results.value.forEach((r, i) => {
    setTimeout(() => downloadSingle(r), i * 200)
  })
}
</script>

<template>
  <ToolPage title="图片格式转换" subtitle="PNG / WebP / JPEG 互转">
    <!-- 目标格式与质量 -->
    <div class="flex flex-wrap items-center gap-4 rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="flex items-center gap-2">
        <label class="text-xs text-neutral-500 dark:text-neutral-400">目标格式</label>
        <select
          v-model="format"
          class="rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        >
          <option v-for="f in formats" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
      </div>
      <div v-if="showQuality" class="flex flex-1 items-center gap-3 min-w-52">
        <label class="text-xs text-neutral-500 dark:text-neutral-400">质量</label>
        <input type="range" v-model.number="quality" min="1" max="100" class="quality-slider flex-1" />
        <span class="w-10 text-right font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">{{ quality }}%</span>
      </div>
    </div>

    <!-- 上传区 -->
    <div
      class="cursor-pointer rounded-sm border-2 border-dashed border-neutral-300 bg-white p-10 text-center transition-colors dark:border-neutral-600 dark:bg-neutral-900 sm:p-14"
      :class="{ 'border-neutral-500 bg-neutral-50 dark:bg-neutral-800': isDragover, 'border-neutral-400': files.length > 0 }"
      @dragover.prevent="isDragover = true"
      @dragleave="isDragover = false"
      @drop.prevent="onDrop"
      @click="fileInput.click()"
    >
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFileChange" />
      <template v-if="files.length === 0">
        <IconPhotoPlus class="mx-auto mb-3 h-10 w-10 text-neutral-400 dark:text-neutral-500" />
        <p class="text-sm text-neutral-600 dark:text-neutral-400">拖拽图片到此处，或点击选择</p>
        <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">支持 PNG / WebP / JPEG 批量转换</p>
      </template>
      <template v-else>
        <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">已选择 {{ files.length }} 个文件</p>
        <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">再次点击可继续添加</p>
      </template>
    </div>

    <!-- 转换按钮 -->
    <button
      v-if="files.length > 0"
      class="w-full rounded-sm bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
      :disabled="converting"
      @click="convert"
    >
      {{ converting ? '转换中...' : '开始转换' }}
    </button>

    <!-- 转换结果 -->
    <div v-if="results.length > 0" class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">转换结果</span>
        <button
          v-if="results.length > 1"
          class="inline-flex items-center gap-1 rounded-sm border border-neutral-200 px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
          @click="downloadAll"
        >
          <IconDownload class="h-3.5 w-3.5" /> 全部下载
        </button>
      </div>

      <div
        v-for="(r, i) in results"
        :key="i"
        class="flex items-center gap-3 rounded-sm border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div class="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-800">
          <img :src="r.url" :alt="r.name" class="h-full w-full object-cover" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100" :title="r.name">{{ r.name }}</div>
          <div class="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{{ formatSize(r.originalSize) }}</span>
            <IconArrowRight class="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
            <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ formatSize(r.convertedSize) }}</span>
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ r.ratio > 0 ? '节省 ' + r.ratio + '%' : '增大 ' + Math.abs(r.ratio) + '%' }}
          </div>
        </div>
        <button
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
          :title="'下载 ' + r.name"
          @click="downloadSingle(r)"
        >
          <IconFileDownload class="h-4 w-4" />
        </button>
      </div>
    </div>
  </ToolPage>
</template>

<style scoped>
/* 纯黑白灰的滑块样式 */
.quality-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #d4d4d4;
  outline: none;
}
.quality-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #404040;
  cursor: pointer;
}
.quality-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: #404040;
  cursor: pointer;
}
.dark .quality-slider {
  background: #404040;
}
.dark .quality-slider::-webkit-slider-thumb {
  background: #d4d4d4;
}
.dark .quality-slider::-moz-range-thumb {
  background: #d4d4d4;
}
</style>
