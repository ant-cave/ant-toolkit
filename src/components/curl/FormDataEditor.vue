<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs text-neutral-500 dark:text-neutral-400">Form Data</span>
      <button class="text-xs text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300" @click="addRow">+ 添加</button>
    </div>
    <div class="space-y-1">
      <div v-for="(f, idx) in fields" :key="f._id"
        class="flex items-center gap-1">
        <input
          class="flex-1 rounded-sm border border-neutral-200 bg-white px-2 py-1 text-xs outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-neutral-500"
          v-model="f.key" placeholder="Field name"
        />
        <span class="text-neutral-300 dark:text-neutral-600">:</span>
        <input
          class="flex-[2] rounded-sm border border-neutral-200 bg-white px-2 py-1 font-mono text-xs outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-neutral-500"
          v-model="f.value" placeholder="Value"
        />
        <label class="cursor-pointer whitespace-nowrap text-xs text-neutral-400 dark:text-neutral-500">
          <input type="checkbox" v-model="f.isFile" class="mr-1 accent-neutral-900 dark:accent-neutral-100" />文件
        </label>
        <button class="px-1 text-xs text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400" @click="removeRow(idx)">x</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

let idCounter = Date.now()
const fields = ref([])

watch(() => props.modelValue, (val) => {
  fields.value = val.map(f => ({ ...f, _id: ++idCounter }))
}, { immediate: true, deep: true })

function addRow() {
  fields.value.push({ _id: ++idCounter, key: '', value: '', isFile: false })
}

function removeRow(idx) {
  fields.value.splice(idx, 1)
  emitChange()
}

function emitChange() {
  emit('update:modelValue', fields.value.map(({ _id, ...rest }) => rest))
}
</script>
