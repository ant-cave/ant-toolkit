<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 日期计算器：日期加减天数/周/月/年，以及两个日期之间的间隔
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconCalendar from '~icons/tabler/calendar'
import { addDays, addMonths, diffInDays, toDateInputValue } from '../../utils/date'

const today = new Date()

// ===== 日期加减 =====
const addBase = ref(toDateInputValue(today))
const addCount = ref(7)
const addUnit = ref('day')

// 按单位加减日期
function applyAdd() {
  const d = new Date(addBase.value)
  if (isNaN(d.getTime())) return null
  const n = Number(addCount.value) || 0
  if (addUnit.value === 'day') return addDays(d, n)
  if (addUnit.value === 'week') return addDays(d, n * 7)
  if (addUnit.value === 'month') return addMonths(d, n)
  return addMonths(d, n * 12)
}

const addResult = computed(() => {
  const d = applyAdd()
  if (!d) return ''
  return toDateInputValue(d)
})

// ===== 日期差 =====
const diffFrom = ref(toDateInputValue(today))
const diffTo = ref(toDateInputValue(addDays(today, 30)))

// 间隔详情：总天数 + 周/年近似
const diffResult = computed(() => {
  const a = new Date(diffFrom.value)
  const b = new Date(diffTo.value)
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null
  const days = diffInDays(a, b)
  return {
    days,
    abs: Math.abs(days),
    weeks: (Math.abs(days) / 7).toFixed(1),
    years: (Math.abs(days) / 365.25).toFixed(2)
  }
})

// 星期几显示
function weekday(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return '星期' + '日一二三四五六'[d.getDay()]
}
</script>

<template>
  <ToolPage title="日期计算器" subtitle="日期加减与间隔计算">
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- 日期加减 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div class="mb-2 flex items-center gap-1.5">
          <IconCalendar class="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
          <label class="text-xs text-neutral-500 dark:text-neutral-400">日期加减</label>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input v-model="addBase" type="date" class="rounded-sm border border-neutral-300 bg-white px-2 py-1.5 font-mono text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
          <span class="text-neutral-400 dark:text-neutral-600">+</span>
          <input v-model.number="addCount" type="number" class="w-20 rounded-sm border border-neutral-300 bg-white px-2 py-1.5 font-mono text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
          <select v-model="addUnit" class="rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100">
            <option value="day">天</option>
            <option value="week">周</option>
            <option value="month">月</option>
            <option value="year">年</option>
          </select>
        </div>

        <div v-if="addResult" class="mt-3 flex items-center justify-between gap-3 rounded-sm border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-950">
          <div>
            <div class="font-mono text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ addResult }}</div>
            <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{{ weekday(addResult) }}</div>
          </div>
          <CopyButton :text="addResult" />
        </div>
      </div>

      <!-- 日期差 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div class="mb-2 flex items-center gap-1.5">
          <IconCalendar class="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
          <label class="text-xs text-neutral-500 dark:text-neutral-400">间隔计算</label>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input v-model="diffFrom" type="date" class="rounded-sm border border-neutral-300 bg-white px-2 py-1.5 font-mono text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
          <span class="text-neutral-400 dark:text-neutral-600">→</span>
          <input v-model="diffTo" type="date" class="rounded-sm border border-neutral-300 bg-white px-2 py-1.5 font-mono text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
        </div>

        <div v-if="diffResult" class="mt-3 rounded-sm border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-950">
          <div class="font-mono text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {{ diffResult.days }} 天
          </div>
          <div class="mt-1 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            <div>约 {{ diffResult.weeks }} 周 / {{ diffResult.years }} 年</div>
            <div class="text-neutral-400 dark:text-neutral-500">{{ diffResult.days >= 0 ? '结束日期在后' : '结束日期在前' }}</div>
          </div>
        </div>
      </div>
    </div>
  </ToolPage>
</template>
