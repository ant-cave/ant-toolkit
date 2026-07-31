<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 随机密码生成工具：可调长度与字符集，附带强度提示，用密码学安全随机数
import { ref, computed, watch } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconKey from '~icons/tabler/key'
import IconWand from '~icons/tabler/wand'

const length = ref(16)
const useUpper = ref(true)
const useLower = ref(true)
const useDigits = ref(true)
const useSymbols = ref(true)
const excludeSimilar = ref(false)
const password = ref('')

// 字符集定义
const SIMILAR = /[Il1Oo0]/g
const CHARSETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()_-+=[]{};:,.<>?/'
}

// 组合后的字符集
const charset = computed(() => {
  let set = ''
  if (useUpper.value) set += CHARSETS.upper
  if (useLower.value) set += CHARSETS.lower
  if (useDigits.value) set += CHARSETS.digits
  if (useSymbols.value) set += CHARSETS.symbols
  if (excludeSimilar.value) set = set.replace(SIMILAR, '')
  return set
})

// 已选字符集数量
const usedKinds = computed(() => [useUpper.value, useLower.value, useDigits.value, useSymbols.value].filter(Boolean).length)

// 使用密码学安全随机数生成密码
function generate() {
  const set = charset.value
  if (!set) {
    password.value = ''
    return
  }
  const arr = new Uint32Array(length.value)
  crypto.getRandomValues(arr)
  password.value = Array.from(arr, (n) => set[n % set.length]).join('')
}

// 强度评估：弱 / 中 / 强
const strength = computed(() => {
  const entropy = Math.round(length.value * Math.log2(Math.max(charset.value.length, 1)))
  if (entropy < 40) return { label: '弱', level: 0 }
  if (entropy < 70) return { label: '中', level: 1 }
  return { label: '强', level: 2 }
})

// 设置变化自动重新生成
watch([length, useUpper, useLower, useDigits, useSymbols, excludeSimilar], generate, { immediate: true })
</script>

<template>
  <ToolPage title="随机密码" subtitle="安全随机密码生成器">
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <!-- 密码展示 -->
      <div class="flex items-center gap-3">
        <code class="min-w-0 flex-1 break-all rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2.5 font-mono text-lg text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100">
          {{ password || '请至少选择一种字符' }}
        </code>
        <div class="flex shrink-0 items-center gap-2">
          <button
            class="inline-flex items-center gap-1 rounded-sm border border-neutral-300 px-3 py-2 text-sm text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
            title="重新生成"
            @click="generate"
          >
            <IconWand class="h-4 w-4" />
          </button>
          <CopyButton :text="password" />
        </div>
      </div>

      <!-- 强度条 -->
      <div v-if="password" class="mt-3 flex items-center gap-2">
        <div class="flex h-1.5 flex-1 gap-1">
          <div v-for="i in 3" :key="i" class="flex-1 rounded-full"
            :class="i <= strength.level ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-200 dark:bg-neutral-800'"></div>
        </div>
        <span class="w-8 text-right text-xs text-neutral-500 dark:text-neutral-400">{{ strength.label }}</span>
      </div>
    </div>

    <!-- 选项 -->
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <!-- 长度 -->
      <div class="flex items-center gap-4">
        <label class="w-24 shrink-0 text-xs text-neutral-500 dark:text-neutral-400">密码长度</label>
        <input type="range" v-model.number="length" min="4" max="64" class="quality-slider flex-1" />
        <span class="w-10 shrink-0 text-right font-mono text-sm font-semibold text-neutral-700 dark:text-neutral-300">{{ length }}</span>
      </div>

      <!-- 字符集 -->
      <div class="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <label class="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <input v-model="useUpper" type="checkbox" class="h-3.5 w-3.5 accent-neutral-900 dark:accent-neutral-100" />
          大写字母
        </label>
        <label class="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <input v-model="useLower" type="checkbox" class="h-3.5 w-3.5 accent-neutral-900 dark:accent-neutral-100" />
          小写字母
        </label>
        <label class="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <input v-model="useDigits" type="checkbox" class="h-3.5 w-3.5 accent-neutral-900 dark:accent-neutral-100" />
          数字
        </label>
        <label class="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <input v-model="useSymbols" type="checkbox" class="h-3.5 w-3.5 accent-neutral-900 dark:accent-neutral-100" />
          符号
        </label>
        <label class="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <input v-model="excludeSimilar" type="checkbox" class="h-3.5 w-3.5 accent-neutral-900 dark:accent-neutral-100" />
          排除相似字符
        </label>
      </div>

      <!-- 字符集预览 -->
      <p v-if="password" class="mt-3 break-all font-mono text-xs text-neutral-400 dark:text-neutral-600">
        {{ charset }}
      </p>
      <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-600">已选 {{ usedKinds }} 类字符</p>
    </div>
  </ToolPage>
</template>

<style scoped>
/* 纯黑白灰的滑块样式 */
.quality-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #d4d4d4;
  outline: none;
}
.quality-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #404040;
  cursor: pointer;
}
.quality-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: #404040;
  cursor: pointer;
}
.dark .quality-slider {
  background: #404040;
}
.dark .quality-slider::-webkit-slider-thumb {
  background: #d4d4d4;
}
.dark .quality-slider::-moz-range-thumb {
  background: #d4d4d4;
}
</style>
