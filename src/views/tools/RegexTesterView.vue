<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 正则测试工具：输入正则与测试文本，实时高亮所有匹配并展示捕获分组
import { ref, computed, watch } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import IconRegex from '~icons/tabler/regex'

const pattern = ref('')
const flags = ref('gmi')
const text = ref('')
const error = ref('')
const matches = ref([])

// 匹配数统计
const matchCount = computed(() => matches.value.length)

// 转义 HTML，防止匹配内容破坏高亮结构
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 执行匹配并生成高亮 HTML
function run() {
  error.value = ''
  matches.value = []
  const patternText = pattern.value
  if (!patternText) return
  try {
    const globalFlags = flags.value.includes('g') ? flags.value : flags.value + 'g'
    const re = new RegExp(patternText, globalFlags)
    const found = []
    const out = []
    let lastIndex = 0
    let m
    // 防止零宽度匹配导致死循环
    while ((m = re.exec(text.value)) !== null) {
      if (m.index === re.lastIndex) re.lastIndex++
      out.push(escapeHtml(text.value.slice(lastIndex, m.index)))
      out.push(
        '<mark class="bg-neutral-900 px-0.5 text-white dark:bg-neutral-100 dark:text-neutral-900">' +
          escapeHtml(m[0]) +
          '</mark>'
      )
      found.push({ match: m[0], index: m.index, groups: m.slice(1) })
      lastIndex = m.index + m[0].length
    }
    out.push(escapeHtml(text.value.slice(lastIndex)))
    matches.value = found
    if (found.length) {
      // 用计算属性保存高亮 HTML
      highlightHtml.value = out.join('')
    } else {
      highlightHtml.value = escapeHtml(text.value)
    }
  } catch (e) {
    error.value = '正则表达式无效：' + e.message
    highlightHtml.value = escapeHtml(text.value)
  }
}

// 高亮后的 HTML（注意：值来自自身转义的输入，安全）
const highlightHtml = ref('')

// 输入变化时自动重新匹配
watch([pattern, flags, text], () => run(), { immediate: true })
</script>

<template>
  <ToolPage title="正则测试" subtitle="实时高亮匹配结果">
    <!-- 正则表达式 -->
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">正则表达式</label>
      <div class="flex items-center gap-2">
        <IconRegex class="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
        <input
          v-model="pattern"
          type="text"
          spellcheck="false"
          placeholder="[a-z]+\d+"
          class="min-w-0 flex-1 rounded-sm border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
        />
      </div>
      <!-- 标志位 -->
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <label v-for="f in ['g', 'i', 'm', 's']" :key="f" class="inline-flex cursor-pointer items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
          <input v-model="flags" type="checkbox" :value="f" class="h-3.5 w-3.5 accent-neutral-900 dark:accent-neutral-100" />
          <span class="font-mono">{{ f }}</span>
        </label>
        <span v-if="matches.length" class="ml-auto font-mono text-xs text-neutral-500 dark:text-neutral-400">
          匹配 {{ matchCount }} 处
        </span>
      </div>
    </div>

    <!-- 测试文本 -->
    <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">测试文本</label>
      <textarea
        v-model="text"
        rows="7"
        spellcheck="false"
        placeholder="粘贴要测试的文本…"
        class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm leading-relaxed text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
      ></textarea>
      <!-- 高亮预览 -->
      <div
        class="mt-3 whitespace-pre-wrap rounded-sm border border-neutral-200 bg-neutral-50 p-3 font-mono text-sm leading-relaxed text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        v-html="highlightHtml"
      ></div>
    </div>

    <p
      v-if="error"
      class="rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      {{ error }}
    </p>

    <!-- 匹配明细 -->
    <div v-if="matches.length" class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">匹配明细</label>
      <div class="max-h-60 space-y-1.5 overflow-y-auto">
        <div
          v-for="(m, i) in matches"
          :key="i"
          class="flex items-baseline gap-2 rounded-sm bg-neutral-100 px-2.5 py-1.5 dark:bg-neutral-800"
        >
          <span class="shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-500">{{ m.index }}</span>
          <span class="shrink-0 font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ m.match }}</span>
          <span v-if="m.groups.length" class="min-w-0 truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
            分组: {{ m.groups.map((g, gi) => `$${gi + 1}=${g ?? '∅'}`).join(', ') }}
          </span>
        </div>
      </div>
    </div>
  </ToolPage>
</template>
