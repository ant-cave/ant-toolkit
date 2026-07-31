// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import Icons from 'unplugin-icons/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    Icons({ compiler: 'vue3' }),
  ],
  // 生成 sourcemap 但不暴露 sourcemap 文件 URL（开源项目便于调试又不会触发额外加载）
  build: {
    sourcemap: 'hidden',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 后端（ant-toolkit-backend，本地跑在 8010；8000 被 ant-cave-backend 占用）
      '/api': {
        target: 'http://localhost:8010',
        changeOrigin: true,
      },
      // OAuth 回调路径同样反代到后端
      '/login': {
        target: 'http://localhost:8010',
        changeOrigin: true,
      },
    },
  },
})
