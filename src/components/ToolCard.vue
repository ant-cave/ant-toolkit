<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 单个工具卡片：名称 + 一句话简介 + 跳转链接
// url 以 / 开头时渲染为站内路由链接，否则为外链（新窗口打开）
import { computed } from 'vue'
import IconExternalLink from '~icons/tabler/external-link'

const props = defineProps({
  // 工具数据 { name, url, description }
  tool: { type: Object, required: true }
})

// 判断是否为站内链接
const isInternal = computed(() =>
  typeof props.tool.url === 'string' && props.tool.url.startsWith('/')
)
// 判断是否有有效链接，无链接时显示占位样式
const hasUrl = computed(() =>
  typeof props.tool.url === 'string' && props.tool.url.length > 0
)
</script>

<template>
  <!-- 有链接：站内链接在当前页跳转 -->
  <RouterLink
    v-if="hasUrl && isInternal"
    :to="tool.url"
    class="group flex h-full flex-col gap-1 rounded-sm border border-neutral-200 bg-white p-3.5 transition-colors hover:border-neutral-400 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-500 sm:p-4"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="truncate text-sm font-medium text-neutral-900 group-hover:text-neutral-500 dark:text-neutral-100 dark:group-hover:text-neutral-300">
        {{ tool.name }}
      </span>
      <IconExternalLink class="shrink-0 text-neutral-300 group-hover:text-neutral-500 dark:text-neutral-600" />
    </div>
    <p v-if="tool.description" class="line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
      {{ tool.description }}
    </p>
  </RouterLink>

  <!-- 有链接：外链新窗口打开 -->
  <a
    v-else-if="hasUrl"
    :href="tool.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex h-full flex-col gap-1 rounded-sm border border-neutral-200 bg-white p-3.5 transition-colors hover:border-neutral-400 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-500 sm:p-4"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="truncate text-sm font-medium text-neutral-900 group-hover:text-neutral-500 dark:text-neutral-100 dark:group-hover:text-neutral-300">
        {{ tool.name }}
      </span>
      <IconExternalLink class="shrink-0 text-neutral-300 group-hover:text-neutral-500 dark:text-neutral-600" />
    </div>
    <p v-if="tool.description" class="line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
      {{ tool.description }}
    </p>
  </a>

  <!-- 无链接：占位卡片，等待补充链接 -->
  <div
    v-else
    class="flex h-full flex-col gap-1 rounded-sm border border-dashed border-neutral-200 bg-white/60 p-3.5 dark:border-neutral-700 dark:bg-neutral-900/60 sm:p-4"
  >
    <span class="text-sm font-medium text-neutral-400 dark:text-neutral-500">
      {{ tool.name || '待补充' }}
    </span>
    <p class="text-xs text-neutral-400 dark:text-neutral-500">链接待补充</p>
  </div>
</template>
