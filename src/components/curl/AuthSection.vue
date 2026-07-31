<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="rounded-sm border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
    <div class="mb-2 text-xs text-neutral-500 dark:text-neutral-400">认证方式</div>
    <div class="mb-2 flex gap-2">
      <label
        v-for="opt in authOptions"
        :key="opt.value"
        class="flex cursor-pointer items-center gap-1"
      >
        <input
          type="radio"
          :value="opt.value"
          :checked="authType === opt.value"
          class="accent-neutral-900 dark:accent-neutral-100"
          @change="$emit('update:authType', opt.value)"
        />
        <span class="text-xs text-neutral-700 dark:text-neutral-300">{{ opt.label }}</span>
      </label>
    </div>
    <div v-if="authType !== 'none'" class="flex items-center gap-2">
      <span class="whitespace-nowrap text-xs text-neutral-400 dark:text-neutral-500">
        {{ authType === 'bearer' ? 'Token' : authType === 'basic' ? 'user:pass' : 'API Key' }}
      </span>
      <input
        class="flex-1 rounded-sm border border-neutral-200 bg-white px-2 py-1 font-mono text-xs outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-neutral-500"
        :value="authValue"
        @input="e => $emit('update:authValue', e.target.value)"
        :placeholder="authType === 'basic' ? 'username:password' : 'token...'"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  authType: { type: String, default: 'none' },
  authValue: { type: String, default: '' }
})

defineEmits(['update:authType', 'update:authValue'])

const authOptions = [
  { value: 'none', label: '无认证' },
  { value: 'bearer', label: 'Bearer' },
  { value: 'basic', label: 'Basic' },
  { value: 'apikey', label: 'API Key' },
]
</script>
