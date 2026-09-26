import { PLAN_STATUS } from '../constants'

// 严格解析 YYYY-MM-DD 日期（按本地日期，规避 new Date('YYYY-MM-DD') 的 UTC 时区偏差）
// 日期缺失或格式非法（含 2026-02-31 这类不存在的日期）时返回 null
export function parseDate(value) {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(year, month - 1, day)
  // 回填校验：排除 2026-02-31 等被 Date 自动进位的非法日期
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

// 当天 0 点（本地时区）
function startOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

const MS_PER_DAY = 86400000

/**
 * 推导出行计划状态
 * - 当天落在 [出发日, 返回日] 区间（含首尾）算进行中
 * - 日期缺失、无法解析，或起止时间异常（如返回早于出发）的历史计划不报错，
 *   统一按「未出发」兜底展示
 *
 * @param {{startDate?: string, endDate?: string}} plan
 * @param {Date} [now] 仅测试时注入
 * @returns {{status: string, daysLeft: number|null, invalid: boolean}}
 */
export function planStatus(plan = {}, now = new Date()) {
  const fallback = { status: PLAN_STATUS.UPCOMING, daysLeft: null, invalid: true }
  if (!plan) return fallback

  const start = parseDate(plan.startDate)
  const end = parseDate(plan.endDate)
  if (!start || !end || end.getTime() < start.getTime()) return fallback

  const today = startOfToday(now)
  const todayMs = today.getTime()

  if (todayMs < start.getTime()) {
    return {
      status: PLAN_STATUS.UPCOMING,
      daysLeft: Math.round((start.getTime() - todayMs) / MS_PER_DAY),
      invalid: false,
    }
  }
  if (todayMs > end.getTime()) {
    return { status: PLAN_STATUS.ENDED, daysLeft: null, invalid: false }
  }
  return { status: PLAN_STATUS.ONGOING, daysLeft: null, invalid: false }
}
