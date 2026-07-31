<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// NCM 解锁工具：将网易云加密 .ncm 音乐转为通用格式（需登录，后端沙箱处理）
import { ref, computed } from 'vue'
import { useRequestStore } from '../../stores/request'
import ToolPage from '../../components/tools/ToolPage.vue'
import IconNetease from '~icons/tabler/brand-netease-music'
import IconLock from '~icons/tabler/lock'
import IconPhotoPlus from '~icons/tabler/photo-plus'
import IconTrash from '~icons/tabler/trash'

const store = useRequestStore()

const fileInput = ref(null)
const isDragover = ref(false)
const file = ref(null)
const converting = ref(false)
const error = ref('')
const success = ref('')

// 已选文件大小格式化
const fileSize = computed(() => {
  if (!file.value) return ''
  const b = file.value.size
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(2) + ' MB'
})

// 取第一个 .ncm 文件（忽略其他类型）
function pickNcm(files) {
  return [...files].find((f) => f.name.toLowerCase().endsWith('.ncm'))
}

function onDrop(e) {
  isDragover.value = false
  const f = pickNcm(e.dataTransfer.files)
  if (f) {
    file.value = f
    error.value = ''
    success.value = ''
  }
}

function onFileChange(e) {
  const f = pickNcm(e.target.files)
  if (f) {
    file.value = f
    error.value = ''
    success.value = ''
  }
  e.target.value = ''
}

function clearFile() {
  file.value = null
  error.value = ''
  success.value = ''
}

async function convert() {
  error.value = ''
  success.value = ''
  if (!file.value) return
  converting.value = true
  try {
    const fd = new FormData()
    fd.append('file', file.value)
    const res = await fetch('/api/ncmdump', { method: 'POST', body: fd, credentials: 'include' })

    if (res.status === 401) {
      error.value = '登录已过期，请重新登录'
      return
    }
    if (res.status === 413) {
      error.value = '文件过大（上限 200MB）'
      return
    }
    if (!res.ok) {
      // 尝试读取后端的错误详情
      let msg = '转换失败'
      try {
        const data = await res.json()
        if (typeof data.detail === 'string' && data.detail) msg = data.detail
      } catch { /* 忽略非 JSON 响应 */ }
      error.value = msg
      return
    }

    // 从响应头解析原始文件名（优先 RFC5987 中文名）
    const blob = await res.blob()
    const cd = res.headers.get('Content-Disposition') || ''
    const unicode = cd.match(/filename\*=UTF-8''([^;]+)/i)
    const ascii = cd.match(/filename="([^"]+)"/i)
    const filename = unicode
      ? decodeURIComponent(unicode[1])
      : ascii ? ascii[1] : file.value.name.replace(/\.ncm$/i, '') + '_unlocked'

    // 触发下载
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    success.value = '转换成功，已开始下载「' + filename + '」'
  } catch (e) {
    error.value = '转换失败：' + e.message
  } finally {
    converting.value = false
  }
}
</script>

<template>
  <ToolPage title="NCM 解锁" subtitle="将 .ncm 加密音乐转为通用格式（需登录）">
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
        class="cursor-pointer rounded-sm border-2 border-dashed border-neutral-300 bg-white p-10 text-center transition-colors dark:border-neutral-600 dark:bg-neutral-900 sm:p-14"
        :class="{ 'border-neutral-500 bg-neutral-50 dark:bg-neutral-800': isDragover, 'border-neutral-400': file }"
        @dragover.prevent="isDragover = true"
        @dragleave="isDragover = false"
        @drop.prevent="onDrop"
        @click="fileInput.click()"
      >
        <input ref="fileInput" type="file" accept=".ncm" class="hidden" @change="onFileChange" />
        <template v-if="!file">
          <IconNetease class="mx-auto mb-3 h-10 w-10 text-neutral-400 dark:text-neutral-500" />
          <p class="text-sm text-neutral-600 dark:text-neutral-400">拖拽 .ncm 文件到此处，或点击选择</p>
          <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">单次转换一个文件，上限 200MB</p>
        </template>
        <template v-else>
          <IconNetease class="mx-auto mb-3 h-10 w-10 text-neutral-400 dark:text-neutral-500" />
          <p class="break-all text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ file.name }}</p>
          <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{{ fileSize }}</p>
        </template>
      </div>

      <!-- 操作按钮 -->
      <div v-if="file" class="flex items-center gap-2">
        <button
          class="flex-1 rounded-sm bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          :disabled="converting"
          @click="convert"
        >
          {{ converting ? '转换中...' : '开始转换' }}
        </button>
        <button
          class="inline-flex items-center gap-1 rounded-sm border border-neutral-300 px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
          title="移除文件"
          @click="clearFile"
        >
          <IconTrash class="h-4 w-4" />
        </button>
      </div>

      <!-- 结果提示 -->
      <p v-if="error" class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
        {{ error }}
      </p>
      <p v-if="success" class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        {{ success }}
      </p>
    </template>
  </ToolPage>
</template>
