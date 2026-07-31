// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

// @vitest-environment node

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dump } from 'ncmdump-js'

// 真实 test.ncm 样例（来自 taurusxin/ncmdump，MIT）
const NCM = new Uint8Array(readFileSync(new URL('./fixtures/sample.ncm', import.meta.url)))

describe('ncmdump-js 解密', () => {
  it('能解出 flac 音频', async () => {
    const result = await dump(NCM)
    expect(result.extension).toBe('flac')
    expect(result.filename).toMatch(/\.flac$/)
    // fLaC 魔数
    expect(Array.from(result.audio.slice(0, 4))).toEqual([0x66, 0x4c, 0x61, 0x43])
    expect(result.blob.size).toBeGreaterThan(0)
  })

  it('能解析歌曲元数据与封面', async () => {
    const result = await dump(NCM)
    expect(result.metadata).toBeTruthy()
    expect(result.metadata.musicName).toBeTruthy()
    expect(result.metadata.artistName).toBeTruthy()
    expect(result.image).toBeTruthy()
    expect(result.image.length).toBeGreaterThan(0)
  })

  it('非法文件会抛错', async () => {
    await expect(dump(new Uint8Array(64).fill(0))).rejects.toThrow()
  })
})
