// 金额格式化：¥1,234.5（整数时不显示小数）
export function formatMoney(value) {
  const n = Number(value) || 0
  const fixed = Number.isInteger(n) ? n.toLocaleString('zh-CN') : n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  return `¥${fixed}`
}

// 日期格式化：YYYY-MM-DD -> YYYY年M月D日；缺失或非法返回空串
export function formatDate(date) {
  if (typeof date !== 'string') return ''
  const match = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!match) return ''
  const [, y, m, d] = match
  // 校验 2 月 31 日这类不存在的日期
  const parsed = new Date(Number(y), Number(m) - 1, Number(d))
  if (
    parsed.getFullYear() !== Number(y) ||
    parsed.getMonth() !== Number(m) - 1 ||
    parsed.getDate() !== Number(d)
  ) {
    return ''
  }
  return `${y}年${Number(m)}月${Number(d)}日`
}

// 日期区间展示：起止任一缺失或非法时以「待定」兜底，避免历史脏数据渲染出 NaN
export function formatDateRange(start, end) {
  const s = formatDate(start)
  const e = formatDate(end)
  if (s && e) return `${s} 至 ${e}`
  return s ? `${s} 出发（返回日期待定）` : e ? `${e} 返回（出发日期待定）` : '日期待定'
}

// 计算两个日期之间的天数（含首尾）
export function daysBetween(start, end) {
  if (!start || !end) return 0
  const s = new Date(start)
  const e = new Date(end)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0
  const diff = Math.round((e - s) / 86400000)
  return diff >= 0 ? diff + 1 : 0
}
