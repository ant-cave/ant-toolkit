// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

import { createRouter, createWebHashHistory } from 'vue-router'

// 使用 hash 路由，部署到任意子路径都无需额外配置
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/online' },
    {
      path: '/online',
      name: 'online',
      component: () => import('../views/OnlineView.vue')
    },
    {
      path: '/local',
      name: 'local',
      component: () => import('../views/LocalView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/tools/curl',
      name: 'curl-tool',
      component: () => import('../views/CurlToolView.vue')
    },
    {
      path: '/tools/jpg-compress',
      name: 'jpg-compress',
      component: () => import('../views/JpgCompressView.vue')
    }
  ]
})

export default router
