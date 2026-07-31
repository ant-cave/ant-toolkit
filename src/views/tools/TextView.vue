<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 文本处理工具：大小写转换、行排序/去重/反转、去除空白等，附带实时统计
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconTextSize from '~icons/tabler/text-size'

const input = ref('')

// 实时文本统计
const stats = computed(() => {
  const s = input.value
  return {
    chars: s.length,
    charsNoSpace: s.replace(/\s/g, '').length,
    words: s.trim() ? s.trim().split(/\s+/).length : 0,
    lines: s ? s.split('\n').length : 0,
    bytes: new TextEncoder().encode(s).length
  }
})

// 执行文本操作（就地转换输入，可连续叠加）
function apply(label, fn) {
  const before = input.value
  const after = fn(before)
  if (after !== before) input.value = after
}

// 各操作定义
const actions = [
  { label: '转大写', icon: 'A', fn: (s) => s.toUpperCase() },
  { label: '转小写', icon: 'a', fn: (s) => s.toLowerCase() },
  { label: '首字母大写', icon: 'Aa', fn: (s) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase()) },
  { label: '去除行首尾空格', icon: '▤', fn: (s) => s.split('\n').map((l) => l.trim()).join('\n') },
  { label: '去除空行', icon: '⧩', fn: (s) => s.split('\n').filter((l) => l.trim() !== '').join('\n') },
  { label: '行去重', icon: '⊘', fn: (s) => [...new Set(s.split('\n'))].join('\n') },
  { label: '行排序', icon: '⇅', fn: (s) => [...s.split('\n')].sort((a, b) => a.localeCompare(b)).join('\n') },
  { label: '反转行序', icon: '⇵', fn: (s) => [...s.split('\n')].reverse().join('\n') },
  { label: '压缩空白', icon: '␣', fn: (s) => s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') },
  { label: '反转全文', icon: '⟲', fn: (s) => [...s].reverse().join('') }
]
</script>

<template>
  <ToolPage title="文本处理" subtitle="大小写 / 排序 / 去重 / 去空白，附带统计">
    <!-- 统计栏 -->
    <div class="flex flex-wrap gap-x-5 gap-y-1 rounded-sm border border-neutral-200 bg-white px-4 py-2.5 font-mono text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
      <span>字符 {{ stats.chars }}</span>
      <span>不含空格 {{ stats.charsNoSpace }}</span>
      <span>单词 {{ stats.words }}</span>
      <span>行数 {{ stats.lines }}</span>
      <span>字节 {{ stats.bytes }}</span>
    </div>

    <!-- 操作按钮 -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="action in actions"
        :key="action.label"
        class="rounded-sm border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
        @click="apply(action.label, action.fn)"
      >
        <span class="mr-1 inline-block w-4 text-center font-mono text-neutral-400 dark:text-neutral-500">{{ action.icon }}</span>
        {{ action.label }}
      </button>
      <button
        class="ml-auto inline-flex items-center gap-1 rounded-sm border border-neutral-300 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-500 dark:hover:border-neutral-500 dark:hover:text-neutral-300"
        @click="input = ''"
      >
        清空
      </button>
    </div>

    <!-- 输入/输出 -->
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="mb-2 flex items-center justify-between gap-2">
        <label class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <IconTextSize class="h-3.5 w-3.5" /> 文本
        </label>
        <CopyButton :text="input" />
      </div>
      <textarea
        v-model="input"
        rows="12"
        spellcheck="false"
        placeholder="输入要处理的文本…"
        class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm leading-relaxed text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
      ></textarea>
    </div>
  </ToolPage>
</template>
