// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

import { describe, it, expect } from 'vitest'

import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../App.vue'

// 测试用内存路由，与生产路由配置保持一致
function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/online' },
      { path: '/online', component: () => import('../views/OnlineView.vue') },
      { path: '/local', component: () => import('../views/LocalView.vue') },
      { path: '/about', component: () => import('../views/AboutView.vue') },
      { path: '/tools/curl', component: () => import('../views/CurlToolView.vue') },
      { path: '/tools/jpg-compress', component: () => import('../views/JpgCompressView.vue') },
    ],
  })
}

describe('App', () => {
  it('渲染顶部 Tab 与在线分类', async () => {
    const router = makeRouter()
    const wrapper = mount(App, {
      global: { plugins: [router, createPinia()] },
    })
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain('在线工具')
    expect(wrapper.text()).toContain('本地部署')
    expect(wrapper.text()).toContain('更多信息')
    expect(wrapper.text()).toContain('开发/代码')
    expect(wrapper.text()).toContain('fastcurl')
    expect(wrapper.text()).toContain('JPG 压缩')
    expect(wrapper.text()).toContain('待补充链接')
  })

  it('切换到本地部署分类', async () => {
    const router = makeRouter()
    const wrapper = mount(App, {
      global: { plugins: [router, createPinia()] },
    })
    await router.isReady()
    await router.push('/local')
    await flushPromises()

    expect(wrapper.text()).toContain('开发/自托管服务')
    expect(wrapper.text()).toContain('监控/面板')
  })

  it('更多信息页展示个人信息', async () => {
    const router = makeRouter()
    const wrapper = mount(App, {
      global: { plugins: [router, createPinia()] },
    })
    await router.isReady()
    await router.push('/about')
    await flushPromises()

    expect(wrapper.text()).toContain('ant-cave')
    expect(wrapper.text()).toContain('GitHub')
    expect(wrapper.text()).toContain('ANTmmmmm@outlook.com')
    expect(wrapper.text()).toContain('fastcurl')
  })

  it('fastcurl 工具页可访问', async () => {
    const router = makeRouter()
    const wrapper = mount(App, {
      global: { plugins: [router, createPinia()] },
    })
    await router.isReady()
    await router.push('/tools/curl')
    await flushPromises()

    expect(wrapper.text()).toContain('图形化 curl 工具')
    expect(wrapper.text()).toContain('发送请求')
  })

  it('JPG 压缩工具页可访问', async () => {
    const router = makeRouter()
    const wrapper = mount(App, {
      global: { plugins: [router, createPinia()] },
    })
    await router.isReady()
    await router.push('/tools/jpg-compress')
    await flushPromises()

    expect(wrapper.text()).toContain('JPG 压缩')
    expect(wrapper.text()).toContain('支持批量压缩')
  })
})
