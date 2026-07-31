<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 通用工具页外壳：统一标题栏 + 内容槽，保证各小工具页风格一致
defineProps({
  // 工具名称
  title: { type: String, required: true },
  // 副标题说明
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4 sm:space-y-6">
    <!-- 工具页头 -->
    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span class="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">{{ title }}</span>
      <span class="text-xs text-neutral-400 dark:text-neutral-500">{{ subtitle }}</span>
    </div>

    <!-- 工具内容 -->
    <slot />
  </div>
</template>
