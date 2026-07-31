// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 ant-cave <ANTmmmmm@outlook.com>
// https://github.com/ant-cave

// 单位换算数据与工具函数
// 每组单位以「单位名 -> 相对基准单位的倍率」存储，温度单独用公式计算

export const UNIT_GROUPS = [
  {
    id: 'length',
    name: '长度',
    units: {
      米: 1,
      千米: 1000,
      厘米: 0.01,
      毫米: 0.001,
      英里: 1609.344,
      码: 0.9144,
      英尺: 0.3048,
      英寸: 0.0254
    }
  },
  {
    id: 'weight',
    name: '重量',
    units: {
      千克: 1,
      克: 0.001,
      毫克: 0.000001,
      吨: 1000,
      磅: 0.45359237,
      盎司: 0.028349523125
    }
  },
  {
    id: 'area',
    name: '面积',
    units: {
      平方米: 1,
      平方千米: 1000000,
      平方厘米: 0.0001,
      公顷: 10000,
      亩: 666.667,
      平方英尺: 0.09290304,
      英亩: 4046.8564224
    }
  },
  {
    id: 'volume',
    name: '体积',
    units: {
      立方米: 1,
      升: 0.001,
      毫升: 0.000001,
      立方厘米: 0.000001,
      加仑: 0.003785411784,
      夸脱: 0.000946352946,
      立方英尺: 0.028316846592
    }
  },
  {
    id: 'speed',
    name: '速度',
    units: {
      '米/秒': 1,
      '千米/时': 0.2777777777777778,
      '英里/时': 0.44704,
      节: 0.5144444444444445,
      '英尺/秒': 0.3048
    }
  },
  {
    id: 'time',
    name: '时间',
    units: {
      秒: 1,
      毫秒: 0.001,
      分钟: 60,
      小时: 3600,
      天: 86400,
      周: 604800
    }
  },
  {
    id: 'data',
    name: '文件大小',
    units: {
      B: 1,
      KB: 1024,
      MB: 1048576,
      GB: 1073741824,
      TB: 1099511627776
    }
  },
  {
    id: 'temperature',
    name: '温度',
    units: ['摄氏度', '华氏度', '开尔文']
  }
]

// 通用换算：value * from 倍率 / to 倍率
export function convertUnits(value, units, from, to) {
  if (from === to) return value
  return (value * units[from]) / units[to]
}

// 温度换算：先统一转为摄氏度，再转目标单位
export function temperatureConvert(value, from, to) {
  let c
  if (from === '摄氏度') c = value
  else if (from === '华氏度') c = ((value - 32) * 5) / 9
  else c = value - 273.15

  if (to === '摄氏度') return c
  if (to === '华氏度') return (c * 9) / 5 + 32
  return c + 273.15
}

// 结果格式化：最多保留 6 位小数，去掉多余尾零
export function formatNumber(value) {
  if (!Number.isFinite(value)) return '—'
  return String(Math.round(value * 1e6) / 1e6)
}
