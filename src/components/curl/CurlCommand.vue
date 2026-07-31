<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div v-if="command" class="rounded-sm border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950">
    <div class="flex items-center justify-between border-b border-neutral-200 px-3 py-1.5 dark:border-neutral-700">
      <span class="text-xs text-neutral-500 dark:text-neutral-400">curl 命令</span>
      <button
        class="text-xs text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
        @click="copy"
      >
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <pre ref="codeEl" class="max-h-32 overflow-x-auto p-3 font-mono text-xs text-neutral-800 dark:text-neutral-200">{{ command }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  command: { type: String, default: '' }
})

const copied = ref(false)
const codeEl = ref(null)

async function copy() {
  try {
    await navigator.clipboard.writeText(codeEl.value?.textContent || '')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>
