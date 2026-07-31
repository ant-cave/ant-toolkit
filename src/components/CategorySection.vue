<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 分类区块：图标 + 分类名 + 工具卡片网格
import CategoryIcon from './CategoryIcon.vue'
import ToolCard from './ToolCard.vue'

defineProps({
  // 分类数据 { id, name, icon, tools[] }
  category: { type: Object, required: true }
})
</script>

<template>
  <section class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
    <!-- 分类标题 -->
    <header class="mb-4 flex items-baseline gap-2">
      <CategoryIcon :name="category.icon" class="h-4 w-4 self-center text-neutral-400 dark:text-neutral-500" />
      <h2 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{{ category.name }}</h2>
      <span class="font-mono text-xs text-neutral-400 dark:text-neutral-500">{{ category.tools.length }}</span>
    </header>

    <!-- 工具卡片网格 -->
    <div
      v-if="category.tools.length > 0"
      class="grid grid-cols-1 auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      <ToolCard v-for="tool in category.tools" :key="tool.url + tool.name" :tool="tool" />
    </div>

    <!-- 空状态占位 -->
    <div
      v-else
      class="rounded-sm border border-dashed border-neutral-200 bg-neutral-100 px-4 py-8 text-center text-sm text-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-500"
    >
      待补充链接
    </div>
  </section>
</template>
