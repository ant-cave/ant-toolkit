<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 在线工具视图：渲染在线分类区块
import CategorySection from '../components/CategorySection.vue'
import { onlineCategories } from '../data/tools.js'
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <CategorySection
      v-for="category in onlineCategories"
      :key="category.id"
      :category="category"
    />
  </div>
</template>
