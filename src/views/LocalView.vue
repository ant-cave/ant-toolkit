<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 本地部署视图：渲染本地部署分类区块
import CategorySection from '../components/CategorySection.vue'
import { localCategories } from '../data/tools.js'
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <CategorySection
      v-for="category in localCategories"
      :key="category.id"
      :category="category"
    />
  </div>
</template>
