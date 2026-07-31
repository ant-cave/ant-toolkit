// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

// ant-toolkit 统一配置文件
//
// 添加工具链接的方法：
// 1. 找到对应分类，在 tools 数组里追加一项
// 2. 每项结构：{ name: 工具名称, url: 链接地址, description: 一句话简介 }
// 3. description 可选，留空则不显示简介
// 4. 如需新增分类，在数组末尾追加 { id, name, icon, tools: [] }
//    icon 值为 tabler 图标名，可到 https://tabler.io/icons 挑选
// 5. url 留空字符串时，卡片显示「待补充」占位样式
// 6. url 以 / 开头的视为站内工具页面（如 '/tools/curl'），点击在当前页跳转

// 在线网页可用的工具箱
export const onlineCategories = [
  {
    id: 'dev',
    name: '开发/代码',
    icon: 'code',
    tools: [
      {
        name: 'fastcurl',
        url: '/tools/curl',
        description: '图形化 curl 工具，支持请求头、JSON 体、LLM 预设'
      }
    ]
  },
  {
    id: 'design',
    name: '图片/设计',
    icon: 'photo',
    tools: [
      {
        name: 'JPG 压缩',
        url: '/tools/jpg-compress',
        description: '批量压缩 JPG 图片，可调节压缩质量'
      }
    ]
  },
  {
    id: 'ai',
    name: 'AI 工具',
    icon: 'robot',
    tools: []
  },
  {
    id: 'writing',
    name: '写作/笔记',
    icon: 'writing',
    tools: []
  },
  {
    id: 'network',
    name: '网络/运维',
    icon: 'network',
    tools: []
  },
  {
    id: 'office',
    name: '效率/办公',
    icon: 'briefcase',
    tools: []
  },
  {
    id: 'media',
    name: '音视频',
    icon: 'movie',
    tools: []
  }
]

// 要本地部署的工具箱
export const localCategories = [
  {
    id: 'selfhost-dev',
    name: '开发/自托管服务',
    icon: 'server',
    tools: []
  },
  {
    id: 'storage',
    name: '存储/网盘',
    icon: 'cloud',
    tools: []
  },
  {
    id: 'media',
    name: '媒体影音',
    icon: 'device-tv',
    tools: []
  },
  {
    id: 'notes',
    name: '笔记/知识库',
    icon: 'book',
    tools: []
  },
  {
    id: 'monitor',
    name: '监控/面板',
    icon: 'activity',
    tools: []
  },
  {
    id: 'sync',
    name: '下载/同步',
    icon: 'download',
    tools: []
  },
  {
    id: 'reading',
    name: '阅读/订阅',
    icon: 'rss',
    tools: []
  }
]
