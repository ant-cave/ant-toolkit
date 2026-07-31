<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 顶部 Tab 导航：在线工具 / 本地部署 / 更多信息
import { RouterLink } from 'vue-router'

// Tab 配置：路由路径与显示名称
const tabs = [
  { path: '/online', label: '在线工具' },
  { path: '/local', label: '本地部署' },
  { path: '/about', label: '更多信息' }
]
</script>

<template>
  <nav class="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
    <div class="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-5"
        :class="
          $route.path === tab.path
            ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
            : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300'
        "
      >
        {{ tab.label }}
      </RouterLink>
    </div>
  </nav>
</template>
