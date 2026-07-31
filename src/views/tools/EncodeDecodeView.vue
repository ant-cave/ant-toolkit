<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 编解码工具：Base64 / URL / HTML 实体 / Unicode 转义 双向转换
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconCode from '~icons/tabler/code'

// 当前模式：base64 / url / html / unicode
const mode = ref('base64')
// 方向：encode 编码 / decode 解码
const direction = ref('encode')
const input = ref('')

const modes = [
  { value: 'base64', label: 'Base64' },
  { value: 'url', label: 'URL' },
  { value: 'html', label: 'HTML 实体' },
  { value: 'unicode', label: 'Unicode 转义' }
]

// Base64 编码（支持 UTF-8）
function base64Encode(s) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(s)))
}
// Base64 解码（支持 UTF-8）
function base64Decode(s) {
  return new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)))
}

// HTML 实体编码
function htmlEncode(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
// HTML 实体解码
function htmlDecode(s) {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = s
  return textarea.value
}

// Unicode 转义编码：非 ASCII 字符转 \uXXXX
function unicodeEncode(s) {
  return s.replace(/[^\x00-\x7F]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
}
// Unicode 转义解码
function unicodeDecode(s) {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

// 依据模式与方向执行转换
const output = computed(() => {
  if (!input.value) return ''
  try {
    if (direction.value === 'encode') {
      if (mode.value === 'base64') return base64Encode(input.value)
      if (mode.value === 'url') return encodeURIComponent(input.value)
      if (mode.value === 'html') return htmlEncode(input.value)
      return unicodeEncode(input.value)
    }
    if (mode.value === 'base64') return base64Decode(input.value)
    if (mode.value === 'url') return decodeURIComponent(input.value)
    if (mode.value === 'html') return htmlDecode(input.value)
    return unicodeDecode(input.value)
  } catch (e) {
    return '⚠ ' + (direction.value === 'decode' ? '解码' : '编码') + '失败：' + e.message
  }
})

// 交换输入输出
function swap() {
  input.value = output.value.startsWith('⚠ ') ? input.value : output.value
}
</script>

<template>
  <ToolPage title="编解码" subtitle="Base64 / URL / HTML 实体 / Unicode 双向转换">
    <!-- 模式选择 -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="m in modes"
        :key="m.value"
        class="rounded-sm border px-3 py-1.5 text-xs transition-colors"
        :class="
          mode === m.value
            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
            : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-100'
        "
        @click="mode = m.value"
      >
        {{ m.label }}
      </button>

      <!-- 方向切换 -->
      <div class="ml-auto flex rounded-sm border border-neutral-300 p-0.5 dark:border-neutral-700">
        <button
          class="rounded-sm px-3 py-1 text-xs transition-colors"
          :class="direction === 'encode' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'"
          @click="direction = 'encode'"
        >
          编码
        </button>
        <button
          class="rounded-sm px-3 py-1 text-xs transition-colors"
          :class="direction === 'decode' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'"
          @click="direction = 'decode'"
        >
          解码
        </button>
      </div>
    </div>

    <!-- 输入 -->
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">输入内容</label>
      <textarea
        v-model="input"
        rows="7"
        spellcheck="false"
        placeholder="输入要转换的内容…"
        class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
      ></textarea>
    </div>

    <!-- 输出 -->
    <div v-if="input" class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="mb-2 flex items-center justify-between gap-2">
        <label class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <IconCode class="h-3.5 w-3.5" /> 输出结果
        </label>
        <div class="flex items-center gap-2">
          <button
            class="rounded-sm border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
            @click="swap"
          >
            交换
          </button>
          <CopyButton :text="output" />
        </div>
      </div>
      <div class="break-all whitespace-pre-wrap rounded-sm border border-neutral-200 bg-neutral-50 p-3 font-mono text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100">
        {{ output }}
      </div>
    </div>
  </ToolPage>
</template>
