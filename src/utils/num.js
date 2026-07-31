// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

// 任意进制转换工具（基于 BigInt，支持超大整数）
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

// 将某进制的字符串解析为 BigInt，无效字符会抛出异常
export function parseBigInt(value, base) {
  const body = String(value).trim().toLowerCase().replace(/^[+-]/, '')
  if (!body) throw new Error('输入为空')
  let big = 0n
  for (const ch of body) {
    const d = DIGITS.indexOf(ch)
    if (d < 0 || d >= base) throw new Error(`包含无效字符「${ch}」`)
    big = big * BigInt(base) + BigInt(d)
  }
  return String(value).trim().startsWith('-') ? -big : big
}

// 将 BigInt 转为某进制的字符串（进制范围 2-36）
export function toBaseString(big, base) {
  if (base < 2 || base > 36) throw new Error('进制必须在 2-36 之间')
  if (big === 0n) return '0'
  let v = big < 0n ? -big : big
  const sign = big < 0n ? '-' : ''
  let out = ''
  const n = BigInt(base)
  while (v > 0n) {
    out = DIGITS[Number(v % n)] + out
    v = v / n
  }
  return sign + out
}

// 校验字符串是否符合指定进制
export function isValidInBase(value, base) {
  const body = String(value).trim().toLowerCase().replace(/^[+-]/, '')
  if (!body) return false
  return new RegExp(`^[${DIGITS.slice(0, base)}]+$`).test(body)
}
