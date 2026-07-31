<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 二维码生成工具：文本/链接转二维码，支持尺寸与容错级别，可下载 PNG
import { ref, watch } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import IconQrcode from '~icons/tabler/qrcode'
import IconDownload from '~icons/tabler/download'
import QRCode from 'qrcode'

const content = ref('https://github.com/ant-cave')
const size = ref(280)
const ecc = ref('M')
const margin = ref(1)
const dataUrl = ref('')
const error = ref('')
const generating = ref(false)

// 容错级别
const eccLevels = [
  { value: 'L', label: '低' },
  { value: 'M', label: '中' },
  { value: 'Q', label: '较高' },
  { value: 'H', label: '高' }
]

let timer = null
async function generate() {
  if (timer) clearTimeout(timer)
  if (!content.value.trim()) {
    dataUrl.value = ''
    error.value = ''
    return
  }
  generating.value = true
  try {
    // 黑白配色，适配整体风格
    dataUrl.value = await QRCode.toDataURL(content.value.trim(), {
      width: size.value,
      margin: margin.value,
      errorCorrectionLevel: ecc.value,
      color: { dark: '#171717', light: '#ffffff' }
    })
    error.value = ''
  } catch (e) {
    error.value = '生成失败：' + e.message
    dataUrl.value = ''
  } finally {
    generating.value = false
  }
}

// 防抖生成
watch([content, size, ecc, margin], () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(generate, 200)
}, { immediate: true })

// 下载二维码 PNG
function download() {
  if (!dataUrl.value) return
  const a = document.createElement('a')
  a.href = dataUrl.value
  a.download = 'qrcode_' + Date.now() + '.png'
  a.click()
}
</script>

<template>
  <ToolPage title="二维码生成" subtitle="文本 / 链接转二维码">
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- 设置区 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">内容</label>
        <textarea
          v-model="content"
          rows="4"
          spellcheck="false"
          placeholder="输入文本或链接…"
          class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
        ></textarea>

        <div class="mt-4 flex items-center gap-4">
          <label class="w-20 shrink-0 text-xs text-neutral-500 dark:text-neutral-400">尺寸</label>
          <input type="range" v-model.number="size" min="160" max="600" step="10" class="quality-slider flex-1" />
          <span class="w-14 shrink-0 text-right font-mono text-xs text-neutral-700 dark:text-neutral-300">{{ size }}px</span>
        </div>

        <div class="mt-4 flex items-center gap-4">
          <label class="w-20 shrink-0 text-xs text-neutral-500 dark:text-neutral-400">容错级别</label>
          <div class="flex gap-1">
            <button
              v-for="level in eccLevels"
              :key="level.value"
              class="rounded-sm border px-2.5 py-1 text-xs transition-colors"
              :class="
                ecc === level.value
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                  : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-400'
              "
              @click="ecc = level.value"
            >
              {{ level.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 预览区 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div class="mb-2 flex items-center justify-between gap-2">
          <label class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <IconQrcode class="h-3.5 w-3.5" /> 预览
          </label>
          <button
            v-if="dataUrl"
            class="inline-flex items-center gap-1 rounded-sm border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
            @click="download"
          >
            <IconDownload class="h-3.5 w-3.5" /> 下载 PNG
          </button>
        </div>
        <div class="flex min-h-64 items-center justify-center rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
          <img v-if="dataUrl" :src="dataUrl" alt="二维码" class="max-h-80 max-w-full" />
          <span v-else-if="generating" class="text-xs text-neutral-400 dark:text-neutral-500">生成中…</span>
          <span v-else class="text-xs text-neutral-400 dark:text-neutral-500">输入内容后自动生成</span>
        </div>
      </div>
    </div>

    <p
      v-if="error"
      class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      {{ error }}
    </p>
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
