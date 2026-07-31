<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div v-if="store.response" class="rounded-sm border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
    <!-- 状态栏 -->
    <div class="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-950">
      <span
        class="rounded-sm px-1.5 py-0.5 text-xs font-medium"
        :class="statusColor"
      >
        {{ store.response.status_code }}
      </span>
      <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ store.response.elapsed_ms }}ms</span>
    </div>

    <!-- Tabs: Body / Headers -->
    <div class="flex border-b border-neutral-200 dark:border-neutral-700">
      <button
        class="border-b-2 px-3 py-1.5 text-xs"
        :class="tab === 'body' ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100' : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'"
        @click="tab = 'body'"
      >响应体</button>
      <button
        class="border-b-2 px-3 py-1.5 text-xs"
        :class="tab === 'headers' ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100' : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'"
        @click="tab = 'headers'"
      >响应头</button>
    </div>

    <!-- 响应体 -->
    <div v-if="tab === 'body'" class="p-3">
      <pre class="max-h-96 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-neutral-800 dark:text-neutral-200">{{ formattedBody }}</pre>
    </div>

    <!-- 响应头 -->
    <div v-if="tab === 'headers'" class="max-h-96 space-y-0.5 overflow-y-auto p-3">
      <div v-for="(v, k) in store.response.headers" :key="k" class="flex gap-2 text-xs">
        <span class="whitespace-nowrap text-neutral-500 dark:text-neutral-400">{{ k }}:</span>
        <span class="break-all font-mono text-neutral-700 dark:text-neutral-300">{{ v }}</span>
      </div>
    </div>
  </div>

  <!-- 空状态 -->
  <div v-else class="rounded-sm border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
    发送请求后响应将显示在这里
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRequestStore } from '../../stores/request'

const store = useRequestStore()
const tab = ref('body')

const statusColor = computed(() => {
  const code = store.response?.status_code || 0
  if (code >= 200 && code < 300) return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
  if (code >= 300 && code < 400) return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
  if (code >= 400 && code < 500) return 'bg-neutral-300 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
  if (code >= 500) return 'bg-neutral-400 text-white dark:bg-neutral-500 dark:text-white'
  return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
})

const formattedBody = computed(() => {
  const body = store.response?.body || ''
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
})
</script>
