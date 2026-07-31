<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 进制转换工具：支持 2-36 进制互转，基于 BigInt 可处理超大整数
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconBinary from '~icons/tabler/binary'
import { parseBigInt, toBaseString, isValidInBase } from '../../utils/num'

const input = ref('255')
const fromBase = ref(10)
const error = ref('')

// 常见进制预设
const bases = [
  { value: 2, label: '二进制' },
  { value: 8, label: '八进制' },
  { value: 10, label: '十进制' },
  { value: 16, label: '十六进制' }
]

// 各进制实时换算结果
const results = computed(() => {
  error.value = ''
  if (!isValidInBase(input.value, fromBase.value)) {
    error.value = '输入包含当前进制（' + fromBase.value + ' 进制）下的无效字符'
    return []
  }
  try {
    const big = parseBigInt(input.value, fromBase.value)
    return bases.map((b) => ({
      base: b.value,
      label: b.label,
      value: toBaseString(big, b.value)
    }))
  } catch (e) {
    error.value = e.message
    return []
  }
})
</script>

<template>
  <ToolPage title="进制转换" subtitle="二进制 / 八进制 / 十进制 / 十六进制互转">
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">输入数值</label>
      <div class="flex items-center gap-2">
        <IconBinary class="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
        <input
          v-model="input"
          type="text"
          spellcheck="false"
          placeholder="请输入数值"
          class="min-w-0 flex-1 rounded-sm border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
        />
        <select
          v-model.number="fromBase"
          class="shrink-0 rounded-sm border border-neutral-300 bg-white px-2 py-2 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        >
          <option v-for="b in bases" :key="b.value" :value="b.value">{{ b.label }}</option>
        </select>
      </div>
    </div>

    <p
      v-if="error"
      class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      {{ error }}
    </p>

    <!-- 换算结果 -->
    <div class="space-y-2">
      <div
        v-for="r in results"
        :key="r.base"
        class="flex items-center gap-3 rounded-sm border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <span class="w-20 shrink-0 text-xs text-neutral-500 dark:text-neutral-400">{{ r.label }}</span>
        <code class="min-w-0 flex-1 break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ r.value }}</code>
        <CopyButton :text="r.value" />
      </div>
    </div>
  </ToolPage>
</template>
