<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// JSON 格式化工具：美化、压缩、校验，解析失败时给出错误提示
import { ref } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconBraces from '~icons/tabler/braces'
import IconBracesOff from '~icons/tabler/braces-off'
import IconCheck from '~icons/tabler/check'
import IconTrash from '~icons/tabler/trash'

const input = ref('')
const output = ref('')
const error = ref('')

// 解析输入，失败时设置错误信息并返回 null
function parse() {
  if (!input.value.trim()) {
    error.value = '请输入 JSON 内容'
    return null
  }
  try {
    return JSON.parse(input.value)
  } catch (e) {
    error.value = 'JSON 解析失败：' + e.message
    return null
  }
}

// 格式化（2 空格缩进）
function format() {
  const data = parse()
  if (data === null) return
  output.value = JSON.stringify(data, null, 2)
  error.value = ''
}

// 压缩成单行
function minify() {
  const data = parse()
  if (data === null) return
  output.value = JSON.stringify(data)
  error.value = ''
}

// 仅校验合法性
function validate() {
  const data = parse()
  if (data === null) return
  output.value = input.value.trim()
  error.value = 'JSON 校验通过'
}

// 清空输入与结果
function clearAll() {
  input.value = ''
  output.value = ''
  error.value = ''
}
</script>

<template>
  <ToolPage title="JSON 格式化" subtitle="美化 / 压缩 / 校验 JSON">
    <!-- 输入区 -->
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">输入 JSON</label>
      <textarea
        v-model="input"
        rows="8"
        spellcheck="false"
        placeholder='{"name": "ant-toolkit", "lang": "zh-CN"}'
        class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
      ></textarea>
    </div>

    <!-- 操作按钮 -->
    <div class="flex flex-wrap gap-2">
      <button
        class="inline-flex items-center gap-1.5 rounded-sm bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        @click="format"
      >
        <IconBraces class="h-4 w-4" /> 格式化
      </button>
      <button
        class="inline-flex items-center gap-1.5 rounded-sm border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
        @click="minify"
      >
        <IconBracesOff class="h-4 w-4" /> 压缩
      </button>
      <button
        class="inline-flex items-center gap-1.5 rounded-sm border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
        @click="validate"
      >
        <IconCheck class="h-4 w-4" /> 校验
      </button>
      <button
        class="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-neutral-300 px-3 py-2 text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-500 dark:hover:border-neutral-500 dark:hover:text-neutral-300"
        @click="clearAll"
      >
        <IconTrash class="h-4 w-4" /> 清空
      </button>
    </div>

    <!-- 提示信息：错误红色，成功灰色 -->
    <p
      v-if="error"
      class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      :class="error.includes('通过') ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-900 dark:text-neutral-100'"
    >
      {{ error }}
    </p>

    <!-- 输出区 -->
    <div v-if="output" class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="mb-2 flex items-center justify-between gap-2">
        <label class="text-xs text-neutral-500 dark:text-neutral-400">输出结果</label>
        <CopyButton :text="output" />
      </div>
      <textarea
        :value="output"
        rows="8"
        readonly
        spellcheck="false"
        class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      ></textarea>
    </div>
  </ToolPage>
</template>
