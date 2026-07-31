<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="rounded-sm border border-neutral-200 bg-white font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900">
    <div class="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400">
      <span>JSON</span>
      <button class="ml-auto text-xs text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300" @click="switchMode">
        {{ codeMode ? '图形模式' : '代码模式' }}
      </button>
      <template v-if="!codeMode">
        <button class="text-xs text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300" @click="addRootKey">
          + 添加字段
        </button>
        <button class="text-xs text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" @click="clearAll">
          清空
        </button>
      </template>
    </div>
    <!-- 图形模式 -->
    <div v-if="!codeMode" class="max-h-80 space-y-1 overflow-y-auto p-2">
      <template v-if="root">
        <JsonNode
          :node="root"
          :depth="0"
          @change="emitChange"
        />
      </template>
      <div v-else class="py-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
        JSON 为空，点击上方 "+ 添加字段" 开始构建
      </div>
    </div>
    <!-- 代码模式 -->
    <div v-else class="p-2">
      <textarea
        class="h-64 w-full resize-y rounded-sm border border-neutral-200 bg-white p-2 font-mono text-xs outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:focus:border-neutral-500"
        :value="codeText"
        @input="onCodeInput"
        placeholder='{"key": "value"}'
      ></textarea>
      <div v-if="codeError" class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{{ codeError }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, provide } from 'vue'
import JsonNode from './JsonNode.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

let uid = Date.now()

const root = ref(null)
let syncing = false
const codeMode = ref(false)
const codeText = ref('')
const codeError = ref('')

function buildNode(val) {
  if (Array.isArray(val)) {
    return reactive({ _id: ++uid, _type: 'array', _expanded: true, _children: val.map(v => buildChild(v, '')) })
  }
  if (typeof val === 'object' && val !== null) {
    return reactive({ _id: ++uid, _type: 'object', _expanded: true, _children: Object.entries(val).map(([k, v]) => buildChild(v, k)) })
  }
  return null
}

function buildChild(val, key) {
  if (typeof val === 'object' && val !== null) {
    return reactive({
      _id: ++uid, _key: key, _type: Array.isArray(val) ? 'array' : 'object', _expanded: true,
      _children: Array.isArray(val) ? val.map((v, i) => buildChild(v, String(i))) : Object.entries(val).map(([k, v]) => buildChild(v, k))
    })
  }
  return reactive({ _id: ++uid, _key: key, _type: guessType(val), _value: val })
}

function guessType(v) {
  if (v === null) return 'null'
  if (typeof v === 'boolean') return 'boolean'
  if (typeof v === 'number') return 'number'
  return 'string'
}

function nodeToValue(node) {
  if (node._type === 'object') {
    const obj = {}
    for (const c of node._children || []) {
      if (c._key !== undefined && c._key !== null) obj[c._key] = nodeToValue(c)
    }
    return obj
  }
  if (node._type === 'array') {
    return (node._children || []).map(c => nodeToValue(c))
  }
  return node._value
}

watch(() => props.modelValue, (val) => {
  if (syncing) return
  const n = buildNode(val)
  root.value = n
  codeText.value = JSON.stringify(val, null, 2)
}, { immediate: true, deep: true })

function switchMode() {
  if (codeMode.value) {
    // 代码 -> 图形：解析 JSON 重建树
    codeError.value = ''
    try {
      const parsed = JSON.parse(codeText.value)
      const n = buildNode(parsed)
      root.value = n
      codeMode.value = false
      syncing = true
      emit('update:modelValue', parsed)
      syncing = false
    } catch (e) {
      codeError.value = 'JSON 格式错误: ' + e.message
      return
    }
  } else {
    // 图形 -> 代码：同步当前值到 textarea
    codeText.value = JSON.stringify(nodeToValue(root.value), null, 2)
    codeMode.value = true
  }
}

function onCodeInput(e) {
  codeText.value = e.target.value
  codeError.value = ''
  try {
    const parsed = JSON.parse(codeText.value)
    syncing = true
    emit('update:modelValue', parsed)
    syncing = false
  } catch {
    // 输入中可能暂时不合法，不报错
  }
}

function addRootKey() {
  if (!root.value) {
    root.value = reactive({ _id: ++uid, _type: 'object', _expanded: true, _children: [] })
  }
  if (!root.value._children) root.value._children = []
  root.value._children.push(reactive({ _id: ++uid, _key: '', _type: 'string', _value: '' }))
  emitChange()
}

function clearAll() {
  root.value = reactive({ _id: ++uid, _type: 'object', _expanded: true, _children: [] })
  codeText.value = '{}'
  emitChange()
}

function emitChange() {
  if (!root.value) {
    syncing = true
    emit('update:modelValue', {})
    syncing = false
    return
  }
  syncing = true
  emit('update:modelValue', nodeToValue(root.value))
  syncing = false
}

provide('notify', emitChange)
</script>
