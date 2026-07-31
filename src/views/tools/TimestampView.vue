<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 时间戳转换工具：时间戳 <-> 日期双向转换，自动识别秒/毫秒
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconClock from '~icons/tabler/clock'
import IconCalendar from '~icons/tabler/calendar'

// 时间戳输入（秒或毫秒）
const tsInput = ref(Math.floor(Date.now() / 1000))
// 日期时间输入（datetime-local）
const dateInput = ref(toLocalDateTimeInput(new Date()))

// 判断时间戳是秒还是毫秒（> 10^11 视为毫秒）
function isMillisecond(ts) {
  return Math.abs(ts) >= 100000000000
}

// Date -> yyyy-MM-ddTHH:mm（本地时间，datetime-local 要求）
function toLocalDateTimeInput(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 时间戳 -> 各种日期格式
const tsResults = computed(() => {
  const ts = Number(tsInput.value)
  if (!Number.isFinite(ts) || String(tsInput.value).trim() === '') return []
  const ms = isMillisecond(ts) ? ts : ts * 1000
  const d = new Date(ms)
  if (isNaN(d.getTime())) return []
  const pad = (n) => String(n).padStart(2, '0')
  return [
    { label: '本地时间', value: d.toLocaleString('zh-CN', { hour12: false }) },
    { label: 'ISO 格式', value: d.toISOString() },
    { label: '年月日时分', value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}` },
    { label: '星期', value: '星期' + '日一二三四五六'[d.getDay()] },
    { label: '时间戳(秒)', value: String(Math.floor(ms / 1000)) },
    { label: '时间戳(毫秒)', value: String(ms) }
  ]
})

// 日期 -> 时间戳
const dateResults = computed(() => {
  if (!dateInput.value) return []
  const d = new Date(dateInput.value)
  if (isNaN(d.getTime())) return []
  const ms = d.getTime()
  return [
    { label: '时间戳(秒)', value: String(Math.floor(ms / 1000)) },
    { label: '时间戳(毫秒)', value: String(ms) }
  ]
})

// 填入当前时间戳
function now() {
  tsInput.value = Math.floor(Date.now() / 1000)
}

// 用时间戳结果反向填充日期输入
function fillFromTimestamp() {
  const first = tsResults.value.find((r) => r.label === '本地时间')
  if (first) dateInput.value = toLocalDateTimeInput(new Date(first.value))
}
</script>

<template>
  <ToolPage title="时间戳转换" subtitle="Unix 时间戳与日期时间互转">
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- 时间戳 -> 日期 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div class="mb-2 flex items-center justify-between gap-2">
          <label class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <IconClock class="h-3.5 w-3.5" /> 时间戳 → 日期
          </label>
          <button class="rounded-sm border border-neutral-300 px-2 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200" @click="now">
            现在
          </button>
        </div>
        <input
          v-model="tsInput"
          type="text"
          inputmode="numeric"
          spellcheck="false"
          placeholder="秒或毫秒时间戳"
          class="w-full rounded-sm border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
        />
        <div class="mt-3 space-y-1.5">
          <div v-for="r in tsResults" :key="r.label" class="flex items-center justify-between gap-2 text-xs">
            <span class="shrink-0 text-neutral-500 dark:text-neutral-400">{{ r.label }}</span>
            <div class="flex min-w-0 items-center gap-1.5">
              <code class="truncate font-mono text-neutral-900 dark:text-neutral-100">{{ r.value }}</code>
              <CopyButton :text="r.value" />
            </div>
          </div>
        </div>
      </div>

      <!-- 日期 -> 时间戳 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div class="mb-2 flex items-center justify-between gap-2">
          <label class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <IconCalendar class="h-3.5 w-3.5" /> 日期 → 时间戳
          </label>
          <button class="rounded-sm border border-neutral-300 px-2 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200" @click="fillFromTimestamp">
            取上方日期
          </button>
        </div>
        <input
          v-model="dateInput"
          type="datetime-local"
          class="w-full rounded-sm border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
        <div class="mt-3 space-y-1.5">
          <div v-for="r in dateResults" :key="r.label" class="flex items-center justify-between gap-2 text-xs">
            <span class="shrink-0 text-neutral-500 dark:text-neutral-400">{{ r.label }}</span>
            <div class="flex min-w-0 items-center gap-1.5">
              <code class="truncate font-mono text-neutral-900 dark:text-neutral-100">{{ r.value }}</code>
              <CopyButton :text="r.value" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolPage>
</template>
