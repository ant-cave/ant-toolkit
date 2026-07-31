// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

import { ref } from 'vue'
import { defineStore } from 'pinia'

// 主题偏好存储键
const STORAGE_KEY = 'toolkit-theme'

export const useThemeStore = defineStore('theme', () => {
  // 当前主题偏好：'light' | 'dark' | 'system'
  const theme = ref('system')
  // 当前是否处于暗色模式（依据偏好与系统主题计算得出）
  const isDark = ref(false)

  // 根据偏好计算并应用暗色类
  function applyTheme() {
    // jsdom 等环境可能不支持 matchMedia，做兼容处理
    const systemDark = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
    const dark = theme.value === 'dark' || (theme.value === 'system' && systemDark)
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
  }

  // 设置主题偏好并持久化
  function setTheme(value) {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme()
  }

  // 切换亮暗（基于当前生效状态，切换后即为显式选择）
  function toggle() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  // 初始化：读取本地偏好，默认跟随系统，并监听系统主题变化
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY)
    theme.value = ['light', 'dark', 'system'].includes(saved) ? saved : 'system'
    applyTheme()
    if (typeof window.matchMedia === 'function') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme.value === 'system') applyTheme()
      })
    }
  }

  return { theme, isDark, setTheme, toggle, initTheme }
})
