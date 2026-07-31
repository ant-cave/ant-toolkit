<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="space-y-4">
    <!-- URL 和方法 -->
    <div class="flex items-center gap-2">
      <select
        class="w-24 rounded-sm border border-neutral-200 bg-white px-2 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-neutral-500"
        v-model="store.method"
      >
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>PATCH</option>
        <option>DELETE</option>
        <option>HEAD</option>
        <option>OPTIONS</option>
      </select>
      <input
        class="flex-1 rounded-sm border border-neutral-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-neutral-500"
        v-model="store.url"
        placeholder="https://api.example.com/endpoint"
      />
    </div>

    <!-- LLM 预设 -->
    <LlmPresets @select="store.applyPreset" />

    <!-- 发包方式切换 -->
    <div class="flex gap-4">
      <label class="flex cursor-pointer items-center gap-1.5">
        <input type="radio" v-model="store.mode" value="browser" class="accent-neutral-900 dark:accent-neutral-100" />
        <span class="text-xs text-neutral-600 dark:text-neutral-400">浏览器端 (fetch)</span>
      </label>
      <label class="flex cursor-pointer items-center gap-1.5">
        <input type="radio" v-model="store.mode" value="server" class="accent-neutral-900 dark:accent-neutral-100" />
        <span class="text-xs text-neutral-600 dark:text-neutral-400">服务端 (代理)</span>
      </label>
    </div>

    <!-- 认证 -->
    <AuthSection
      :authType="store.authType"
      :authValue="store.authValue"
      @update:authType="store.authType = $event"
      @update:authValue="store.authValue = $event"
    />

    <!-- 请求头 -->
    <HeadersEditor v-model="store.headers" />

    <!-- 请求体类型 -->
    <div>
      <div class="mb-2 flex gap-2">
        <label
          v-for="opt in bodyTypeOptions"
          :key="opt.value"
          class="flex cursor-pointer items-center gap-1"
        >
          <input
            type="radio"
            :value="opt.value"
            v-model="store.bodyType"
            class="accent-neutral-900 dark:accent-neutral-100"
          />
          <span class="text-xs text-neutral-700 dark:text-neutral-300">{{ opt.label }}</span>
        </label>
      </div>

      <!-- JSON 树形编辑器 -->
      <div v-if="store.bodyType === 'json'">
        <JsonTreeEditor v-model="store.bodyJson" />
      </div>

      <!-- Form Data -->
      <div v-if="store.bodyType === 'form'">
        <FormDataEditor v-model="store.bodyForm" />
      </div>
    </div>

    <!-- 服务端模式未登录提示 -->
    <div v-if="store.mode === 'server' && !store.user && !store.authLoading"
      class="rounded-sm border border-dashed border-neutral-300 p-4 text-center text-xs text-neutral-400 dark:border-neutral-600 dark:text-neutral-500"
    >
      服务端模式需要登录，<button class="text-neutral-700 underline dark:text-neutral-300" @click="store.login()">点击登录</button>
    </div>

    <!-- 发送按钮 -->
    <button
      class="w-full rounded-sm bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
      :disabled="!store.url || store.loading || (store.mode === 'server' && !store.user)"
      @click="store.send()"
    >
      {{ store.loading ? '发送中...' : '发送请求' }}
    </button>
  </div>
</template>

<script setup>
import { useRequestStore } from '../../stores/request'
import LlmPresets from './LlmPresets.vue'
import AuthSection from './AuthSection.vue'
import HeadersEditor from './HeadersEditor.vue'
import JsonTreeEditor from './JsonTreeEditor.vue'
import FormDataEditor from './FormDataEditor.vue'

const store = useRequestStore()

const bodyTypeOptions = [
  { value: 'none', label: '无请求体' },
  { value: 'json', label: 'JSON' },
  { value: 'form', label: 'Form Data' },
]
</script>
