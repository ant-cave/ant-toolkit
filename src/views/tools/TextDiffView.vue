<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 文本 diff 工具：对比两段文本，用黑白灰差异高亮展示
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import IconFileDiff from '~icons/tabler/file-diff'
import { diffLines } from 'diff'

const original = ref('第一行\n第二行\n第三行\n')
const changed = ref('第一行\n第二行已修改\n第四行\n')

// 逐行构建 diff 结果
const parts = computed(() => {
  const lines = []
  for (const part of diffLines(original.value, changed.value)) {
    // 以行拆分并去掉末尾换行符留下的空串
    const items = part.value.split('\n')
    if (items[items.length - 1] === '') items.pop()
    for (const line of items) {
      lines.push({ type: part.added ? 'added' : part.removed ? 'removed' : 'same', text: line })
    }
  }
  return lines
})

// 统计摘要
const summary = computed(() => {
  let added = 0
  let removed = 0
  for (const p of parts.value) {
    if (p.type === 'added') added++
    else if (p.type === 'removed') removed++
  }
  return { added, removed }
})
</script>

<template>
  <ToolPage title="文本 diff" subtitle="对比两段文本的差异">
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- 原文 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">原文</label>
        <textarea
          v-model="original"
          rows="10"
          spellcheck="false"
          class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm leading-relaxed text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
        ></textarea>
      </div>
      <!-- 对比 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">对比文本</label>
        <textarea
          v-model="changed"
          rows="10"
          spellcheck="false"
          class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm leading-relaxed text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
        ></textarea>
      </div>
    </div>

    <!-- 差异结果 -->
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="mb-2 flex items-center justify-between gap-2">
        <label class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <IconFileDiff class="h-3.5 w-3.5" /> 差异结果
        </label>
        <span v-if="summary.added || summary.removed" class="font-mono text-xs text-neutral-500 dark:text-neutral-400">
          +{{ summary.added }} / -{{ summary.removed }}
        </span>
      </div>

      <!-- 无差异提示 -->
      <div
        v-if="!summary.added && !summary.removed"
        class="rounded-sm border border-dashed border-neutral-300 py-6 text-center text-sm text-neutral-400 dark:border-neutral-700 dark:text-neutral-500"
      >
        两段文本完全一致
      </div>

      <!-- 差异行 -->
      <div v-else class="max-h-80 overflow-y-auto rounded-sm border border-neutral-200 dark:border-neutral-700">
        <div
          v-for="(p, i) in parts"
          :key="i"
          class="flex whitespace-pre-wrap break-all border-b border-neutral-200 px-2 py-0.5 font-mono text-xs leading-relaxed last:border-b-0 dark:border-neutral-800"
          :class="
            p.type === 'added'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : p.type === 'removed'
                ? 'bg-neutral-200 text-neutral-500 line-through dark:bg-neutral-800 dark:text-neutral-400'
                : 'bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100'
          "
        >
          <span class="mr-2 select-none text-neutral-400 dark:text-neutral-500">{{ p.type === 'added' ? '+' : p.type === 'removed' ? '-' : ' ' }}</span>
          {{ p.text || ' ' }}
        </div>
      </div>
    </div>
  </ToolPage>
</template>
