// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
