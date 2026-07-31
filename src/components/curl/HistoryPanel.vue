<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="rounded-sm border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
    <div class="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-950">
      <div class="flex gap-3">
        <button
          class="text-xs"
          :class="tab === 'history' ? 'font-medium text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'"
          @click="tab = 'history'"
        >历史 ({{ store.history.length }})</button>
        <button
          class="text-xs"
          :class="tab === 'favorites' ? 'font-medium text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'"
          @click="tab = 'favorites'"
        >收藏 ({{ store.favorites.length }})</button>
      </div>
      <button
        v-if="tab === 'history' && store.history.length > 0"
        class="text-xs text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
        @click="store.clearHistory()"
      >清空</button>
    </div>

    <div class="max-h-80 overflow-y-auto">
      <div v-if="items.length === 0" class="p-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
        {{ tab === 'history' ? '暂无历史记录' : '暂无收藏' }}
      </div>
      <div v-for="(item, idx) in items" :key="idx"
        class="cursor-pointer border-b border-neutral-100 px-3 py-2 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
        @click="store.loadFromHistory(item)"
      >
        <div class="flex items-center gap-2">
          <span class="w-12 font-mono text-xs text-neutral-500 dark:text-neutral-400">{{ item.method }}</span>
          <span class="flex-1 truncate font-mono text-xs text-neutral-800 dark:text-neutral-200">{{ item.url }}</span>
          <button
            class="text-xs text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400"
            @click.stop="store.toggleFavorite(item)"
          >
            {{ isFav(item) ? '*' : 'o' }}
          </button>
        </div>
        <div v-if="item.response" class="mt-0.5 flex gap-2">
          <span
            class="rounded-sm px-1 text-[11px]"
            :class="item.response.status_code >= 200 && item.response.status_code < 300 ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200' : 'bg-neutral-300 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'"
          >{{ item.response.status_code }}</span>
          <span class="text-[11px] text-neutral-400 dark:text-neutral-500">{{ item.response.elapsed_ms }}ms</span>
          <span class="text-[11px] text-neutral-400 dark:text-neutral-500">{{ formatTime(item.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRequestStore } from '../../stores/request'

const store = useRequestStore()
const tab = ref('history')

const items = computed(() =>
  tab.value === 'history' ? store.history : store.favorites
)

function isFav(item) {
  return store.favorites.some(f => f.url === item.url && f.timestamp === item.timestamp)
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}
</script>
