<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// Markdown 预览工具：左侧编辑、右侧实时渲染，可复制 HTML
import { ref, watch } from 'vue'
import ToolPage from '../../components/tools/ToolPage.vue'
import CopyButton from '../../components/tools/CopyButton.vue'
import IconMarkdown from '~icons/tabler/markdown'
import { marked } from 'marked'

const input = ref('# 欢迎使用 Markdown 预览\n\n输入 **Markdown** 内容，右侧实时预览。\n\n- 列表项\n- 加粗、*斜体*、`代码`\n\n> 引用块\n\n```js\nconsole.log(\'hello\')\n```\n')
const html = ref('')

function render() {
  html.value = marked.parse(input.value, { breaks: true })
}

watch(input, render, { immediate: true })
</script>

<template>
  <ToolPage title="Markdown 预览" subtitle="实时渲染，支持复制 HTML">
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- 编辑区 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div class="mb-2 flex items-center justify-between gap-2">
          <label class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <IconMarkdown class="h-3.5 w-3.5" /> 编辑
          </label>
          <CopyButton :text="html" label="复制 HTML" />
        </div>
        <textarea
          v-model="input"
          rows="16"
          spellcheck="false"
          class="w-full resize-y rounded-sm border border-neutral-300 bg-white p-3 font-mono text-sm leading-relaxed text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
        ></textarea>
      </div>

      <!-- 预览区 -->
      <div class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <label class="mb-2 block text-xs text-neutral-500 dark:text-neutral-400">预览</label>
        <div class="markdown-body max-h-[480px] overflow-y-auto rounded-sm border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-950">
          <div v-html="html"></div>
        </div>
      </div>
    </div>
  </ToolPage>
</template>

<style scoped>
/* Markdown 渲染样式（纯黑白灰） */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  font-weight: 700;
  color: #171717;
  margin: 0.75em 0 0.4em;
  line-height: 1.3;
}
.markdown-body :deep(h1) {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #e5e5e5;
}
.markdown-body :deep(h2) {
  font-size: 1.25em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #e5e5e5;
}
.markdown-body :deep(h3) {
  font-size: 1.1em;
}
.markdown-body :deep(p) {
  margin: 0.5em 0;
  line-height: 1.7;
}
.markdown-body :deep(a) {
  color: #171717;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
  line-height: 1.7;
}
.markdown-body :deep(ul) {
  list-style: disc;
}
.markdown-body :deep(ol) {
  list-style: decimal;
}
.markdown-body :deep(blockquote) {
  margin: 0.5em 0;
  padding: 0.25em 1em;
  border-left: 3px solid #a3a3a3;
  color: #525252;
}
.markdown-body :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
  background: #e5e5e5;
  padding: 0.15em 0.35em;
  border-radius: 2px;
}
.markdown-body :deep(pre) {
  margin: 0.5em 0;
  padding: 0.75em 1em;
  background: #262626;
  color: #f5f5f5;
  border-radius: 2px;
  overflow-x: auto;
}
.markdown-body :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}
.markdown-body :deep(table) {
  margin: 0.5em 0;
  border-collapse: collapse;
  font-size: 0.875em;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #d4d4d4;
  padding: 0.35em 0.75em;
}
.markdown-body :deep(th) {
  background: #f5f5f5;
  font-weight: 600;
}
.markdown-body :deep(hr) {
  margin: 1em 0;
  border: none;
  border-top: 1px solid #e5e5e5;
}
.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 2px;
}
.dark .markdown-body :deep(h1),
.dark .markdown-body :deep(h2),
.dark .markdown-body :deep(h3),
.dark .markdown-body :deep(h4) {
  color: #f5f5f5;
}
.dark .markdown-body :deep(h1),
.dark .markdown-body :deep(h2) {
  border-bottom-color: #404040;
}
.dark .markdown-body :deep(a) {
  color: #f5f5f5;
}
.dark .markdown-body :deep(blockquote) {
  border-left-color: #525252;
  color: #a3a3a3;
}
.dark .markdown-body :deep(code) {
  background: #404040;
}
.dark .markdown-body :deep(pre) {
  background: #171717;
  color: #e5e5e5;
}
.dark .markdown-body :deep(th),
.dark .markdown-body :deep(td) {
  border-color: #404040;
}
.dark .markdown-body :deep(th) {
  background: #262626;
}
.dark .markdown-body :deep(hr) {
  border-top-color: #404040;
}
</style>
