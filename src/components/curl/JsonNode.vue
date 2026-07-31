<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="select-none">
    <div v-if="node._type === 'object' || node._type === 'array'">
      <div
        class="flex items-center gap-1 rounded-sm px-1 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        :style="{ paddingLeft: depth * 16 + 4 + 'px' }"
        @click="toggle"
      >
        <span class="w-3 text-xs text-neutral-400 dark:text-neutral-500">{{ node._expanded ? 'v' : '>' }}</span>
        <input
          v-if="depth > 0"
          class="flex-1 rounded-sm border-b border-dashed border-neutral-300 bg-transparent px-1 text-xs outline-none focus:border-neutral-600 dark:border-neutral-600 dark:focus:border-neutral-400"
          v-model="node._key"
          @click.stop
          placeholder="key"
        />
        <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ node._type === 'array' ? '[]' : '{}' }}</span>
        <span class="text-xs text-neutral-400 dark:text-neutral-500">{{ node._children ? node._children.length : 0 }} 项</span>
        <button
          v-if="depth > 0"
          class="ml-auto text-xs text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400"
          @click.stop="removeSelf"
        >x</button>
      </div>
      <div v-if="node._expanded && node._children" class="space-y-0.5">
        <div v-for="(child, idx) in node._children" :key="child._id">
          <JsonNode
            :node="child"
            :depth="depth + 1"
            :parent-node="node"
            :parent-index="idx"
          />
        </div>
        <div class="flex gap-1" :style="{ paddingLeft: (depth + 1) * 16 + 20 + 'px' }">
          <button class="text-xs text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300" @click="addChild">+ 添加</button>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center gap-1 rounded-sm px-1 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      :style="{ paddingLeft: depth * 16 + 4 + 'px' }">
      <span class="w-3 text-xs text-neutral-400 dark:text-neutral-500">&nbsp;</span>
      <input
        v-if="depth > 0"
        class="w-24 rounded-sm border-b border-dashed border-neutral-300 bg-transparent px-1 text-xs outline-none focus:border-neutral-600 dark:border-neutral-600 dark:focus:border-neutral-400"
        v-model="node._key"
        placeholder="key"
      />
      <span class="text-xs text-neutral-400 dark:text-neutral-500">:</span>

      <input
        v-if="node._type === 'string'"
        class="flex-1 rounded-sm border-b border-dashed border-neutral-300 bg-transparent px-1 font-mono text-xs outline-none focus:border-neutral-600 dark:border-neutral-600 dark:focus:border-neutral-400"
        v-model="node._value"
        placeholder="value"
      />
      <input
        v-else-if="node._type === 'number'"
        type="number"
        class="w-32 rounded-sm border-b border-dashed border-neutral-300 bg-transparent px-1 text-right font-mono text-xs outline-none focus:border-neutral-600 dark:border-neutral-600 dark:focus:border-neutral-400"
        v-model.number="node._value"
      />
      <select
        v-else-if="node._type === 'boolean'"
        class="rounded-sm border border-neutral-300 bg-transparent px-1 text-xs outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
        v-model="node._value"
      >
        <option :value="true">true</option>
        <option :value="false">false</option>
      </select>
      <span v-else-if="node._type === 'null'" class="text-xs text-neutral-400 dark:text-neutral-500">null</span>

      <select
        class="ml-2 rounded-sm border border-neutral-200 bg-transparent px-1 text-xs text-neutral-400 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500"
        :value="node._type"
        @change="changeType($event.target.value)"
      >
        <option value="string">string</option>
        <option value="number">number</option>
        <option value="boolean">boolean</option>
        <option value="null">null</option>
        <option value="object">object</option>
        <option value="array">array</option>
      </select>

      <button
        v-if="depth > 0"
        class="ml-auto text-xs text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400"
        @click="removeSelf"
      >x</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, inject } from 'vue'

let uid = Date.now()

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  parentNode: { type: Object, default: null },
  parentIndex: { type: Number, default: -1 }
})

const notify = inject('notify', () => {})

function toggle() {
  props.node._expanded = !props.node._expanded
  notify()
}

function addChild() {
  if (!props.node._children) props.node._children = []
  props.node._children.push(reactive({ _id: ++uid, _key: '', _type: 'string', _value: '' }))
  notify()
}

function removeSelf() {
  if (props.parentNode && props.parentIndex >= 0) {
    props.parentNode._children.splice(props.parentIndex, 1)
    notify()
  }
}

function changeType(type) {
  const n = props.node
  n._type = type
  if (type === 'object') { n._children = []; n._expanded = true; delete n._value }
  else if (type === 'array') { n._children = []; n._expanded = true; delete n._value }
  else if (type === 'null') { n._value = null }
  else if (type === 'boolean') { n._value = false }
  else if (type === 'number') { n._value = 0 }
  else { n._value = '' }
  notify()
}
</script>
