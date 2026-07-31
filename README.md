<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

# ant-toolkit

工具箱导航站：在线网页可用的工具箱与本地部署的工具箱导航，参照 fastcurl 简约黑白灰配色，支持亮色 / 暗色模式。

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- Vite
- Tailwind CSS
- Pinia
- Vitest / Playwright

## 项目结构

- `src/data/tools.js` — 工具箱导航数据（在线 / 本地分类与链接），直接编辑此文件维护链接
- `src/data/profile.js` — 个人信息配置（更多信息页面）
- `src/views/` — 在线工具 / 本地部署 / 更多信息 三个页面

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with Vitest

```sh
pnpm test:unit
```

### Run End-to-End Tests with Playwright

```sh
# 安装浏览器（首次运行）
npx playwright install

# 运行 e2e 测试（CI 模式使用 preview 服务）
CI=true pnpm test:e2e --project=chromium
```

## License

[GNU Affero General Public License v3.0](LICENSE)
