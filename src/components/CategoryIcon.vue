<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<script setup>
// 图标映射组件：根据数据里的 tabler 图标名渲染对应图标
import IconCode from '~icons/tabler/code'
import IconPhoto from '~icons/tabler/photo'
import IconRobot from '~icons/tabler/robot'
import IconWriting from '~icons/tabler/writing'
import IconNetwork from '~icons/tabler/network'
import IconBriefcase from '~icons/tabler/briefcase'
import IconMovie from '~icons/tabler/movie'
import IconServer from '~icons/tabler/server'
import IconCloud from '~icons/tabler/cloud'
import IconDeviceTv from '~icons/tabler/device-tv'
import IconBook from '~icons/tabler/book'
import IconActivity from '~icons/tabler/activity'
import IconDownload from '~icons/tabler/download'
import IconRss from '~icons/tabler/rss'

// 图标名 -> 组件 映射表
const iconMap = {
  code: IconCode,
  photo: IconPhoto,
  robot: IconRobot,
  writing: IconWriting,
  network: IconNetwork,
  briefcase: IconBriefcase,
  movie: IconMovie,
  server: IconServer,
  cloud: IconCloud,
  'device-tv': IconDeviceTv,
  book: IconBook,
  activity: IconActivity,
  download: IconDownload,
  rss: IconRss
}

defineProps({
  // tabler 图标名
  name: { type: String, required: true }
})
</script>

<template>
  <component :is="iconMap[name] || IconCode" />
</template>
