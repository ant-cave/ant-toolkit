<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 复制按钮：点击复制指定文本，成功后短暂显示「已复制」反馈
import { ref } from 'vue'
import IconCopy from '~icons/tabler/copy'
import IconCheck from '~icons/tabler/check'
import { copyText } from '../../utils/copy'

const props = defineProps({
  // 要复制的文本
  text: { type: String, required: true },
  // 按钮文字
  label: { type: String, default: '复制' }
})

const copied = ref(false)

async function onCopy() {
  if (await copyText(props.text)) {
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  }
}
</script>

<template>
  <button
    type="button"
    class="inline-flex shrink-0 items-center gap-1 rounded-sm border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
    :disabled="copied"
    @click="onCopy"
  >
    <IconCheck v-if="copied" class="h-3.5 w-3.5" />
    <IconCopy v-else class="h-3.5 w-3.5" />
    {{ copied ? '已复制' : label }}
  </button>
</template>
