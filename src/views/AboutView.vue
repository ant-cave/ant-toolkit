<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 更多信息页面：展示个人信息、联系方式与项目列表
import { computed } from 'vue'
import { profile } from '../data/profile.js'
import IconBrandGithub from '~icons/tabler/brand-github'
import IconMail from '~icons/tabler/mail'
import IconWorld from '~icons/tabler/world'
import IconExternalLink from '~icons/tabler/external-link'

// 头像占位：取名字的首字母大写
const initial = computed(() => (profile.name ? profile.name.charAt(0).toUpperCase() : 'A'))
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- 个人信息卡片 -->
    <section class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
      <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <!-- 头像占位 -->
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xl font-bold text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
          {{ initial }}
        </div>

        <!-- 基本信息 -->
        <div class="flex flex-col items-center gap-1 sm:items-start">
          <h1 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">{{ profile.name }}</h1>
          <p v-if="profile.tagline" class="text-sm text-neutral-500 dark:text-neutral-400">{{ profile.tagline }}</p>
          <p v-if="profile.location" class="text-xs text-neutral-400 dark:text-neutral-500">{{ profile.location }}</p>
        </div>
      </div>

      <!-- 联系链接 -->
      <div class="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
        <a
          v-if="profile.github"
          :href="profile.github"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-sm border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
        >
          <IconBrandGithub class="h-4 w-4" />
          GitHub
        </a>
        <a
          v-if="profile.email"
          :href="`mailto:${profile.email}`"
          class="inline-flex items-center gap-1.5 rounded-sm border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
        >
          <IconMail class="h-4 w-4" />
          {{ profile.email }}
        </a>
        <a
          v-if="profile.website"
          :href="profile.website"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-sm border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
        >
          <IconWorld class="h-4 w-4" />
          个人网站
        </a>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
      <!-- 个人简介 -->
      <section
        v-if="profile.bio.length > 0"
        class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
      >
        <h2 class="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">个人简介</h2>
        <p v-for="(line, index) in profile.bio" :key="index" class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {{ line }}
        </p>
      </section>

      <!-- 技术栈 -->
      <section
        v-if="profile.skills.length > 0"
        class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
      >
        <h2 class="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">技术栈</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in profile.skills"
            :key="skill"
            class="rounded-sm bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {{ skill }}
          </span>
        </div>
      </section>
    </div>

    <!-- 项目列表 -->
    <section
      v-if="profile.projects.length > 0"
      class="rounded-sm border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
    >
      <h2 class="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">项目</h2>
      <div class="grid grid-cols-1 auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a
          v-for="project in profile.projects"
          :key="project.name"
          :href="project.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex h-full flex-col gap-1 rounded-sm border border-neutral-200 bg-white p-3.5 transition-colors hover:border-neutral-400 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-500 sm:p-4"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-sm font-medium text-neutral-900 group-hover:text-neutral-500 dark:text-neutral-100 dark:group-hover:text-neutral-300">
              {{ project.name }}
            </span>
            <IconExternalLink class="shrink-0 text-neutral-300 group-hover:text-neutral-500 dark:text-neutral-600" />
          </div>
          <p v-if="project.description" class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {{ project.description }}
          </p>
        </a>
      </div>
    </section>
  </div>
</template>
