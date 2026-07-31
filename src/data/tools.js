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
      },
      {
        name: 'JSON 格式化',
        url: '/tools/json-formatter',
        description: '美化、压缩、校验 JSON'
      },
      {
        name: '正则测试',
        url: '/tools/regex',
        description: '实时高亮正则匹配结果'
      },
      {
        name: '进制转换',
        url: '/tools/base-convert',
        description: '二/八/十/十六进制互转，支持超大整数'
      },
      {
        name: '哈希计算',
        url: '/tools/hash',
        description: 'MD5 / SHA-1 / SHA-256 等哈希计算'
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
      },
      {
        name: '图片格式转换',
        url: '/tools/image-convert',
        description: 'PNG / WebP / JPEG 互转'
      },
      {
        name: '二维码生成',
        url: '/tools/qrcode',
        description: '文本 / 链接生成二维码，可下载 PNG'
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
    tools: [
      {
        name: 'Markdown 预览',
        url: '/tools/markdown',
        description: 'Markdown 实时渲染，可复制 HTML'
      },
      {
        name: '文本 diff',
        url: '/tools/text-diff',
        description: '对比两段文本的差异'
      },
      {
        name: '文本处理',
        url: '/tools/text',
        description: '大小写、排序、去重、去空白等'
      }
    ]
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
    tools: [
      {
        name: '编解码',
        url: '/tools/encode-decode',
        description: 'Base64 / URL / HTML 实体 / Unicode 互转'
      },
      {
        name: '时间戳转换',
        url: '/tools/timestamp',
        description: 'Unix 时间戳与日期互转'
      },
      {
        name: '日期计算器',
        url: '/tools/date-calc',
        description: '日期加减与间隔计算'
      },
      {
        name: '单位换算',
        url: '/tools/unit-convert',
        description: '长度、重量、温度、文件大小等'
      },
      {
        name: 'UUID 生成',
        url: '/tools/uuid',
        description: '批量生成 UUID v4'
      },
      {
        name: '随机密码',
        url: '/tools/password',
        description: '安全随机密码生成器'
      }
    ]
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
