<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div v-if="processing" class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80">
    <span class="text-sm text-neutral-500 dark:text-neutral-400">登录中...</span>
  </div>
</template>

<script setup>
// OAuth 回调处理：若 URL 中带有 code/state（兼容旧式前端换 token 流程），
// 交给后端完成换取并回跳；后端 BFF 模式已直接处理回调时这里为空操作。
import { ref, onMounted } from 'vue'
import { useRequestStore } from '../../stores/request'

const store = useRequestStore()
const processing = ref(false)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  if (code && state) {
    processing.value = true
    try {
      const storedState = sessionStorage.getItem('pkce_state')
      if (storedState !== state) {
        console.error('OAuth state mismatch')
        return
      }
      const codeVerifier = sessionStorage.getItem('pkce_code_verifier')
      sessionStorage.removeItem('pkce_code_verifier')
      sessionStorage.removeItem('pkce_state')
      if (!codeVerifier) {
        console.error('Missing code_verifier')
        return
      }
      const data = await store.handleCallback(code, codeVerifier)
      if (data.redirect) {
        window.location.href = data.redirect
      }
    } catch (e) {
      console.error('OAuth callback error:', e)
    } finally {
      processing.value = false
    }
  }
})
</script>
