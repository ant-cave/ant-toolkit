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
    },
    {
      path: '/tools/json-formatter',
      name: 'json-formatter',
      component: () => import('../views/tools/JsonFormatterView.vue')
    },
    {
      path: '/tools/regex',
      name: 'regex-tester',
      component: () => import('../views/tools/RegexTesterView.vue')
    },
    {
      path: '/tools/base-convert',
      name: 'base-convert',
      component: () => import('../views/tools/BaseConvertView.vue')
    },
    {
      path: '/tools/hash',
      name: 'hash',
      component: () => import('../views/tools/HashView.vue')
    },
    {
      path: '/tools/markdown',
      name: 'markdown-preview',
      component: () => import('../views/tools/MarkdownPreviewView.vue')
    },
    {
      path: '/tools/text-diff',
      name: 'text-diff',
      component: () => import('../views/tools/TextDiffView.vue')
    },
    {
      path: '/tools/text',
      name: 'text-tool',
      component: () => import('../views/tools/TextView.vue')
    },
    {
      path: '/tools/encode-decode',
      name: 'encode-decode',
      component: () => import('../views/tools/EncodeDecodeView.vue')
    },
    {
      path: '/tools/timestamp',
      name: 'timestamp',
      component: () => import('../views/tools/TimestampView.vue')
    },
    {
      path: '/tools/uuid',
      name: 'uuid',
      component: () => import('../views/tools/UuidView.vue')
    },
    {
      path: '/tools/password',
      name: 'password',
      component: () => import('../views/tools/PasswordGenView.vue')
    },
    {
      path: '/tools/qrcode',
      name: 'qrcode',
      component: () => import('../views/tools/QrCodeView.vue')
    },
    {
      path: '/tools/unit-convert',
      name: 'unit-convert',
      component: () => import('../views/tools/UnitConvertView.vue')
    },
    {
      path: '/tools/date-calc',
      name: 'date-calc',
      component: () => import('../views/tools/DateCalcView.vue')
    },
    {
      path: '/tools/image-convert',
      name: 'image-convert',
      component: () => import('../views/tools/ImageConvertView.vue')
    },
    {
      path: '/tools/ncmdump',
      name: 'ncmdump',
      component: () => import('../views/tools/NcmDumpView.vue')
    }
  ]
})

export default router
