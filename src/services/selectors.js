import { EXPENSE_CATEGORIES } from '../constants'
import { luggageCompletionRate } from './luggage'

function toNum(value) {
  return Number(value) || 0
}

// 单次出行总花费
export function planTotalSpend(plan) {
  return (plan.records || []).reduce(
    (sum, r) =>
      sum +
      toNum(r.transportCost) +
      toNum(r.mealCost) +
      toNum(r.ticketCost) +
      toNum(r.shoppingCost) +
      toNum(r.otherCost),
    0
  )
}

// 单次出行花费分类汇总
export function planSpendBreakdown(plan) {
  const records = plan.records || []
  return EXPENSE_CATEGORIES.reduce((acc, { key, label }) => {
    acc[label] = records.reduce((sum, r) => sum + toNum(r[key]), 0)
    return acc
  }, {})
}

// 单次出行行李打包完成率（各成员平均）
export function planPackingRate(plan) {
  const lists = plan.luggage || []
  if (!lists.length) return 0
  const sum = lists.reduce((s, l) => s + luggageCompletionRate(l.items), 0)
  return Math.round(sum / lists.length)
}

// 单次出行待办完成进度（0-100）
export function planTodoProgress(plan) {
  const todos = plan.todos || []
  if (!todos.length) return 0
  return Math.round((todos.filter((t) => t.done).length / todos.length) * 100)
}

// 判断待办是否全部完成
export function planTodosAllDone(plan) {
  const todos = plan.todos || []
  return todos.length > 0 && todos.every((t) => t.done)
}

// ===== 出行状态 =====
export const PLAN_STATUS = {
  UPCOMING: 'upcoming', // 未出发
  ONGOING: 'ongoing', // 进行中
  ENDED: 'ended', // 已结束
}

export const PLAN_STATUS_META = {
  [PLAN_STATUS.UPCOMING]: { label: '未出发', tagClass: 'tag-blue' },
  [PLAN_STATUS.ONGOING]: { label: '进行中', tagClass: 'tag-green' },
  [PLAN_STATUS.ENDED]: { label: '已结束', tagClass: 'tag-gray' },
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const PLAN_DATE_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/

// 解析计划日期（YYYY-MM-DD，按本地零点），缺失或非法（如 2026-02-31）一律返回 null
function parsePlanDate(value) {
  if (typeof value !== 'string') return null
  const match = value.match(PLAN_DATE_RE)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date.getTime()
}

/**
 * 根据当天日期与计划起止时间推导出行状态
 * 日期缺失、非法或起止倒置的历史计划统一按「未出发」兜底，不抛错
 * @param {Object} plan 出行计划
 * @param {Date} [now] 仅测试用，默认取当前时间
 * @returns {{ status: string, daysToStart: number|null }} daysToStart 仅未出发且日期有效时给出
 */
export function planStatus(plan, now = new Date()) {
  const start = parsePlanDate(plan?.startDate)
  const end = parsePlanDate(plan?.endDate)
  if (start == null || end == null || start > end) {
    return { status: PLAN_STATUS.UPCOMING, daysToStart: null }
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (today < start) {
    return {
      status: PLAN_STATUS.UPCOMING,
      daysToStart: Math.round((start - today) / MS_PER_DAY),
    }
  }
  if (today <= end) return { status: PLAN_STATUS.ONGOING, daysToStart: 0 }
  return { status: PLAN_STATUS.ENDED, daysToStart: 0 }
}
