// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

/** @type {import('tailwindcss').Config} */
export default {
  // 使用 class 策略，通过 html 元素的 dark 类切换暗色模式
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,jsx,ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
