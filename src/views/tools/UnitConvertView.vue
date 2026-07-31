<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 单位换算工具：长度 / 重量 / 面积 / 体积 / 速度 / 时间 / 文件大小 / 温度
import { ref, computed } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconRuler from '~icons/tabler/ruler'
import {
  UNIT_GROUPS,
  convertUnits,
  temperatureConvert,
  formatNumber
} from '../../utils/units'

const groupId = ref('length')
const value = ref('1')
const fromUnit = ref('米')
const toUnit = ref('千米')

// 当前分组
const group = computed(() => UNIT_GROUPS.find((g) => g.id === groupId.value))
// 是否温度组
const isTemperature = computed(() => group.value?.id === 'temperature')
// 单位列表
const unitNames = computed(() =>
  isTemperature.value ? group.value.units : Object.keys(group.value.units)
)

// 切换分组时重置单位
function selectGroup(id) {
  groupId.value = id
  const names = isTemperature.value ? ['摄氏度', '华氏度', '开尔文'] : Object.keys(UNIT_GROUPS.find((g) => g.id === id).units)
  fromUnit.value = names[0]
  toUnit.value = names[1]
  value.value = '1'
}

// 换算结果
const result = computed(() => {
  const v = Number(value.value)
  if (value.value.trim() === '' || !Number.isFinite(v)) return ''
  const units = group.value.units
  const out = isTemperature.value
    ? temperatureConvert(v, fromUnit.value, toUnit.value)
    : convertUnits(v, units, fromUnit.value, toUnit.value)
  return formatNumber(out)
})
</script>

<template>
  <ToolPage title="单位换算" subtitle="长度 / 重量 / 面积 / 体积 / 速度 / 时间 / 文件大小 / 温度">
    <!-- 分组切换 -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="g in UNIT_GROUPS"
        :key="g.id"
        class="rounded-sm border px-3 py-1.5 text-xs transition-colors"
        :class="
          groupId === g.id
            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
            : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-100'
        "
        @click="selectGroup(g.id)"
      >
        {{ g.name }}
      </button>
    </div>

    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <label class="mb-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        <IconRuler class="h-3.5 w-3.5" /> 数值与单位
      </label>
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="value"
          type="text"
          inputmode="decimal"
          spellcheck="false"
          placeholder="1"
          class="w-28 rounded-sm border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
        />
        <select
          v-model="fromUnit"
          class="rounded-sm border border-neutral-300 bg-white px-2 py-2 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        >
          <option v-for="u in unitNames" :key="u" :value="u">{{ u }}</option>
        </select>
        <span class="text-neutral-400 dark:text-neutral-600">→</span>
        <select
          v-model="toUnit"
          class="rounded-sm border border-neutral-300 bg-white px-2 py-2 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        >
          <option v-for="u in unitNames" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>

      <!-- 结果 -->
      <div v-if="result !== ''" class="mt-4 flex items-center justify-between gap-3 rounded-sm border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-950">
        <div class="min-w-0">
          <div class="font-mono text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ result }}</div>
          <div class="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
            {{ value || 0 }} {{ fromUnit }} = {{ result }} {{ toUnit }}
          </div>
        </div>
        <CopyButton :text="String(result)" />
      </div>
    </div>
  </ToolPage>
</template>
