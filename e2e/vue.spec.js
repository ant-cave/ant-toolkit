// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

import { test, expect } from '@playwright/test'

test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText('在线工具')
  await expect(page.locator('body')).toContainText('本地部署')
})

test('switches to local deploy tab', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: '本地部署' }).click()
  await expect(page.locator('body')).toContainText('开发/自托管服务')
  await expect(page.locator('body')).toContainText('阅读/订阅')
})

test('about page shows personal info', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: '更多信息' }).click()
  await expect(page.locator('body')).toContainText('ant-cave')
  await expect(page.locator('body')).toContainText('ANTmmmmm@outlook.com')
})

test('theme toggle switches to dark mode', async ({ page }) => {
  await page.goto('/')
  // 初始跟随系统，若已是暗色则先切到亮色
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  await page.getByRole('button').click()
  if (isDark) {
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  } else {
    await expect(page.locator('html')).toHaveClass(/dark/)
  }
})

test('navigates to fastcurl tool', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /fastcurl/ }).click()
  await expect(page.locator('body')).toContainText('图形化 curl 工具')
  await expect(page.locator('body')).toContainText('发送请求')
})

test('navigates to jpg compress tool', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /JPG 压缩/ }).click()
  await expect(page.locator('body')).toContainText('图片压缩工具')
  await expect(page.locator('body')).toContainText('支持批量压缩')
})
