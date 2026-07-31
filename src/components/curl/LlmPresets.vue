<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="rounded-sm border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
    <div class="mb-2 text-xs text-neutral-500 dark:text-neutral-400">LLM API 预设</div>
    <div class="flex flex-wrap gap-1">
      <button
        v-for="preset in presets"
        :key="preset.name"
        class="rounded-sm border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        @click="$emit('select', preset)"
      >
        {{ preset.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRequestStore } from '../../stores/request'

const store = useRequestStore()
const presets = store.LLM_PRESETS

defineEmits(['select'])
</script>
