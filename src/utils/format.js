// 金额格式化：¥1,234.5（整数时不显示小数）
export function formatMoney(value) {
  const n = Number(value) || 0
  const fixed = Number.isInteger(n) ? n.toLocaleString('zh-CN') : n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  return `¥${fixed}`
}

// 日期格式化：YYYY-MM-DD -> YYYY年M月D日；缺失或格式异常时原样兜底，避免渲染报错
export function formatDate(date) {
  if (!date || typeof date !== 'string') return date ? String(date) : ''
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(date.trim())
  if (!match) return date
  return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`
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
