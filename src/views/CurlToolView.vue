<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// fastcurl 工具页：图形化 curl（登录在顶栏全局处理）
import { onMounted } from 'vue'
import { useRequestStore } from '../stores/request'
import RequestPanel from '../components/curl/RequestPanel.vue'
import ResponsePanel from '../components/curl/ResponsePanel.vue'
import CurlCommand from '../components/curl/CurlCommand.vue'
import HistoryPanel from '../components/curl/HistoryPanel.vue'

const store = useRequestStore()

onMounted(() => {
  store.checkAuth()
})
</script>

<template>
  <div>
    <!-- 工具页头 -->
    <div class="mb-4 flex items-center gap-2">
      <span class="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">fastcurl</span>
      <span class="text-xs text-neutral-400 dark:text-neutral-500">图形化 curl 工具</span>
    </div>

    <!-- 主内容 -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-5 sm:gap-6">
      <!-- 左侧：请求构建 -->
      <div class="space-y-4 lg:col-span-3">
        <RequestPanel />
        <CurlCommand :command="store.curlCommand" />
      </div>

      <!-- 右侧：响应 + 历史 -->
      <div class="space-y-4 lg:col-span-2">
        <ResponsePanel />
        <HistoryPanel />
      </div>
    </div>
  </div>
</template>
