<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// UUID 生成工具：批量生成 v4 UUID，支持大写与去连字符
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconCards from '~icons/tabler/cards'

const count = ref(10)
const uppercase = ref(false)
const noHyphen = ref(false)
const list = ref([])

// 生成单个 UUID v4
function makeUuid() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // 兼容不支持 randomUUID 的环境
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) || (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 按选项格式化
function formatUuid(uuid) {
  let out = uuid
  if (noHyphen.value) out = out.replace(/-/g, '')
  if (uppercase.value) out = out.toUpperCase()
  return out
}

function generate() {
  const n = Math.max(1, Math.min(100, Number(count.value) || 1))
  list.value = Array.from({ length: n }, () => formatUuid(makeUuid()))
}

// 全部结果拼成一行（换行分隔），便于一次复制
const allText = computed(() => list.value.join('\n'))
</script>

<template>
  <ToolPage title="UUID 生成" subtitle="批量生成 UUID v4">
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="flex flex-wrap items-end gap-4">
        <!-- 数量 -->
        <div>
          <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">数量（1-100）</label>
          <input
            v-model.number="count"
            type="number"
            min="1"
            max="100"
            class="w-28 rounded-sm border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>
        <!-- 选项 -->
        <div class="flex flex-wrap gap-4 pb-1">
          <label class="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <input v-model="uppercase" type="checkbox" class="h-3.5 w-3.5 accent-neutral-900 dark:accent-neutral-100" />
            大写
          </label>
          <label class="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <input v-model="noHyphen" type="checkbox" class="h-3.5 w-3.5 accent-neutral-900 dark:accent-neutral-100" />
            无连字符
          </label>
        </div>
        <button
          class="ml-auto rounded-sm bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          @click="generate"
        >
          生成
        </button>
      </div>
    </div>

    <!-- 结果列表 -->
    <div v-if="list.length" class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="mb-2 flex items-center justify-between gap-2">
        <label class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <IconCards class="h-3.5 w-3.5" /> 结果（{{ list.length }} 个）
        </label>
        <CopyButton :text="allText" label="复制全部" />
      </div>
      <div class="max-h-72 space-y-1 overflow-y-auto">
        <div
          v-for="(uuid, i) in list"
          :key="i"
          class="flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <code class="min-w-0 flex-1 truncate font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ uuid }}</code>
          <CopyButton :text="uuid" />
        </div>
      </div>
    </div>
  </ToolPage>
</template>
