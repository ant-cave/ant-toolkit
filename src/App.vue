<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// ant-toolkit 工具箱导航页：顶部 Tab 切换在线工具 / 本地部署 / 更多信息
import { onMounted } from 'vue'
import { useThemeStore } from './stores/theme'
import { useRequestStore } from './stores/request'
import TabNav from './components/TabNav.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import LoginButton from './components/auth/LoginButton.vue'
import OAuthCallbackHandler from './components/auth/OAuthCallbackHandler.vue'

const themeStore = useThemeStore()
const requestStore = useRequestStore()

onMounted(() => {
  // 初始化主题偏好
  themeStore.initTheme()
  // 全站检查登录态（登录后回跳会据此刷新用户信息）
  requestStore.checkAuth()
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <!-- OAuth 回调处理（全站监听，兼容带 code/state 的回跳） -->
    <OAuthCallbackHandler />

    <!-- 顶栏 -->
    <header class="border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 sm:px-6">
      <div class="mx-auto flex max-w-6xl items-center gap-2">
        <span class="font-mono text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">ant-toolkit</span>
        <span class="hidden text-xs text-neutral-400 dark:text-neutral-500 sm:inline">工具箱导航</span>
        <div class="ml-auto flex items-center gap-3">
          <LoginButton />
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- Tab 导航 -->
    <TabNav />

    <!-- 主内容 -->
    <main class="mx-auto max-w-6xl p-4 sm:p-6">
      <router-view />
    </main>
  </div>
</template>
