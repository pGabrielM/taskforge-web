import { format, formatDistanceToNowStrict, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60)
  const minutes = Math.round(total % 60)
  if (hours === 0) return `${minutes}min`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes.toString().padStart(2, '0')}min`
}

export function formatDate(date: Date | string | null | undefined, pattern = "d 'de' MMM"): string {
  if (!date) return '—'
  return format(new Date(date), pattern, { locale: ptBR })
}

export function relative(date: Date | string): string {
  return formatDistanceToNowStrict(new Date(date), { locale: ptBR, addSuffix: true })
}

export function dueState(date: Date | string | null | undefined, done: boolean) {
  if (!date || done) return 'none' as const
  const d = new Date(date)
  if (isToday(d)) return 'today' as const
  if (isPast(d)) return 'overdue' as const
  return 'future' as const
}

export const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
