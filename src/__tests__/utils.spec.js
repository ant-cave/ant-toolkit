// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

import { describe, it, expect } from 'vitest'

import { parseBigInt, toBaseString, isValidInBase } from '../utils/num'
import { convertUnits, temperatureConvert, formatNumber } from '../utils/units'
import { addDays, addMonths, diffInDays } from '../utils/date'

describe('进制转换工具', () => {
  it('十进制与十六进制互转', () => {
    expect(toBaseString(parseBigInt('255', 10), 16)).toBe('ff')
    expect(toBaseString(parseBigInt('ff', 16), 10)).toBe('255')
  })

  it('支持超大整数', () => {
    const big = '115792089237316195423570985008687907853269984665640564039457584007913129639936'
    expect(toBaseString(parseBigInt(big, 10), 10)).toBe(big)
  })

  it('支持负数', () => {
    expect(toBaseString(parseBigInt('-42', 10), 2)).toBe('-101010')
  })

  it('校验非法字符', () => {
    expect(() => parseBigInt('2f', 2)).toThrow()
    expect(isValidInBase('1010', 2)).toBe(true)
    expect(isValidInBase('123', 2)).toBe(false)
  })
})

describe('单位换算工具', () => {
  it('长度换算', () => {
    expect(convertUnits(1, { m: 1, km: 1000 }, 'km', 'm')).toBe(1000)
    expect(convertUnits(100, { m: 1, cm: 0.01 }, 'cm', 'm')).toBe(1)
  })

  it('温度换算：摄氏度与华氏度', () => {
    expect(temperatureConvert(0, '摄氏度', '华氏度')).toBe(32)
    expect(temperatureConvert(100, '摄氏度', '华氏度')).toBe(212)
    expect(temperatureConvert(32, '华氏度', '摄氏度')).toBe(0)
    expect(temperatureConvert(0, '摄氏度', '开尔文')).toBeCloseTo(273.15, 5)
  })

  it('结果格式化', () => {
    expect(formatNumber(1 / 3)).toBe('0.333333')
    expect(formatNumber(1000)).toBe('1000')
  })
})

describe('日期计算工具', () => {
  it('天数加减', () => {
    const d = addDays(new Date('2026-01-31'), 1)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(1)
    expect(d.getDate()).toBe(1)
  })

  it('月份加减处理月末溢出（1月31日 + 1月 回退到 2月28日）', () => {
    const d = addMonths(new Date(2026, 0, 31), 1)
    expect(d.getDate()).toBe(28)
    expect(d.getMonth()).toBe(1)
  })

  it('日期差按整天计算', () => {
    const a = new Date(2026, 0, 1)
    const b = new Date(2026, 0, 10)
    expect(diffInDays(a, b)).toBe(9)
    expect(diffInDays(b, a)).toBe(-9)
  })
})
