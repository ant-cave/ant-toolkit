<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 哈希计算工具：MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512
// MD5 用 js-md5，SHA 系列用浏览器内置 Web Crypto，全程本地计算
import { ref, watch } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconHash from '~icons/tabler/hash'
import md5 from 'js-md5'

const input = ref('')
const algorithm = ref('MD5')
const output = ref('')
const error = ref('')
const computing = ref(false)

// 可选算法（Web Crypto 支持的 SHA 系列）
const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

async function compute() {
  error.value = ''
  output.value = ''
  if (!input.value) return
  computing.value = true
  try {
    if (algorithm.value === 'MD5') {
      // 等待微任务，保持界面一致
      output.value = md5(input.value)
    } else {
      const name = algorithm.value
      const data = new TextEncoder().encode(input.value)
      const digest = await crypto.subtle.digest(name, data)
      output.value = [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    }
  } catch (e) {
    error.value = '计算失败：' + e.message
  } finally {
    computing.value = false
  }
}

// 输入或算法变化时自动计算
watch([input, algorithm], () => compute(), { immediate: true })
</script>

<template>
  <ToolPage title="哈希计算" subtitle="MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512">
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">输入内容</label>
      <textarea
        v-model="input"
        rows="6"
        spellcheck="false"
        placeholder="输入要计算哈希的文本…"
        class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
      ></textarea>
    </div>

    <!-- 算法选择 -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="algo in algorithms"
        :key="algo"
        class="rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors"
        :class="
          algorithm === algo
            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
            : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-100'
        "
        @click="algorithm = algo"
      >
        {{ algo }}
      </button>
      <span v-if="computing" class="ml-auto font-mono text-xs text-neutral-400 dark:text-neutral-500">计算中…</span>
    </div>

    <p
      v-if="error"
      class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      {{ error }}
    </p>

    <!-- 结果 -->
    <div v-if="output" class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="mb-2 flex items-center justify-between gap-2">
        <label class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <IconHash class="h-3.5 w-3.5" /> {{ algorithm }} 结果
        </label>
        <CopyButton :text="output" />
      </div>
      <div class="break-all rounded-sm border border-neutral-200 bg-neutral-50 p-3 font-mono text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100">
        {{ output }}
      </div>
    </div>
  </ToolPage>
</template>
