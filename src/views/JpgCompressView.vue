<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="mx-auto max-w-3xl space-y-4 sm:space-y-6">
    <!-- 工具页头 -->
    <div class="flex items-center gap-2">
      <span class="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">JPG 压缩</span>
      <span class="text-xs text-neutral-400 dark:text-neutral-500">图片压缩工具</span>
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
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/jpg"
        multiple
        class="hidden"
        @change="onFileChange"
      />
      <template v-if="files.length === 0">
        <IconPhotoPlus class="mx-auto mb-3 h-10 w-10 text-neutral-400 dark:text-neutral-500" />
        <p class="text-sm text-neutral-600 dark:text-neutral-400">拖拽 JPG 图片到此处，或点击选择</p>
        <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">支持批量压缩</p>
      </template>
      <template v-else>
        <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">已选择 {{ files.length }} 个文件</p>
        <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">再次点击可继续添加</p>
      </template>
    </div>

    <!-- 压缩质量 -->
    <div v-if="files.length > 0" class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">压缩质量</label>
      <div class="flex items-center gap-4">
        <input
          type="range"
          v-model.number="quality"
          min="1"
          max="100"
          class="quality-slider flex-1"
        />
        <span class="min-w-[42px] text-right font-mono text-sm font-semibold text-neutral-700 dark:text-neutral-300">{{ quality }}%</span>
      </div>
    </div>

    <!-- 压缩按钮 -->
    <button
      v-if="files.length > 0"
      class="w-full rounded-sm bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
      :disabled="compressing"
      @click="compress"
    >
      {{ compressing ? '压缩中...' : '开始压缩' }}
    </button>

    <!-- 压缩结果 -->
    <div v-if="results.length > 0" class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">压缩结果</span>
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
            <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ formatSize(r.compressedSize) }}</span>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IconPhotoPlus from '~icons/tabler/photo-plus'
import IconDownload from '~icons/tabler/download'
import IconFileDownload from '~icons/tabler/file-download'
import IconArrowRight from '~icons/tabler/arrow-right'

const fileInput = ref(null)
const isDragover = ref(false)
const files = ref([])
const quality = ref(75)
const compressing = ref(false)
const results = ref([])

function onDrop(e) {
  isDragover.value = false
  const dropped = [...e.dataTransfer.files].filter(f => f.type === 'image/jpeg')
  if (dropped.length) files.value = [...files.value, ...dropped]
}

function onFileChange(e) {
  const selected = [...e.target.files]
  if (selected.length) files.value = [...files.value, ...selected]
  e.target.value = ''
}

async function compress() {
  if (!files.value.length) return
  compressing.value = true
  results.value = []

  for (const file of files.value) {
    try {
      const compressed = await compressImage(file, quality.value / 100)
      const ratio = ((1 - compressed.size / file.size) * 100).toFixed(1)
      results.value.push({
        name: file.name,
        url: URL.createObjectURL(compressed),
        blob: compressed,
        originalSize: file.size,
        compressedSize: compressed.size,
        ratio: Number(ratio),
      })
    } catch {
      // 跳过压缩失败的文件
    }
  }

  compressing.value = false
}

function compressImage(file, q) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('压缩失败'))),
        'image/jpeg',
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
  a.download = r.name.replace(/\.jpe?g$/i, '') + '_compressed.jpg'
  a.click()
}

function downloadAll() {
  results.value.forEach((r, i) => {
    setTimeout(() => downloadSingle(r), i * 200)
  })
}
</script>

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
