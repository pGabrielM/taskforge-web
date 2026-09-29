import { endOfDay, endOfMonth, endOfWeek, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns'

export const PERIODS = {
  week: 'Esta semana',
  'last-week': 'Semana passada',
  month: 'Este mês',
  'last-month': 'Mês passado',
} as const

export type Period = keyof typeof PERIODS

export function resolvePeriod(value: string | undefined): { period: Period; from: Date; to: Date } {
  const now = new Date()
  const period: Period = value && value in PERIODS ? (value as Period) : 'week'
  switch (period) {
    case 'last-week': {
      const ref = subWeeks(now, 1)
      return { period, from: startOfWeek(ref, { weekStartsOn: 1 }), to: endOfWeek(ref, { weekStartsOn: 1 }) }
    }
    case 'month':
      return { period, from: startOfMonth(now), to: endOfDay(now) }
    case 'last-month': {
      const ref = subMonths(now, 1)
      return { period, from: startOfMonth(ref), to: endOfMonth(ref) }
    }
    default:
      return { period, from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) }
  }
}

