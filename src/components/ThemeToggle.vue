<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 主题切换按钮：点击在亮色 / 暗色之间切换
import { useThemeStore } from '../stores/theme'
import IconSun from '~icons/tabler/sun'
import IconMoon from '~icons/tabler/moon'

const themeStore = useThemeStore()
</script>

<template>
  <button
    type="button"
    :title="themeStore.isDark ? '切换到亮色模式' : '切换到暗色模式'"
    class="rounded-sm p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
    @click="themeStore.toggle()"
  >
    <!-- 暗色时显示太阳，亮色时显示月亮 -->
    <IconSun v-if="themeStore.isDark" class="h-5 w-5" />
    <IconMoon v-else class="h-5 w-5" />
  </button>
</template>
