import type { Priority, ProjectStatus, TaskStatus } from '@prisma/client'

export const TASK_STATUSES: TaskStatus[] = ['TODO', 'DOING', 'REVIEW', 'DONE']

export const taskStatusLabel: Record<TaskStatus, string> = {
  TODO: 'A fazer',
  DOING: 'Em andamento',
  REVIEW: 'Em revisão',
  DONE: 'Concluído',
}

export const taskStatusDot: Record<TaskStatus, string> = {
  TODO: 'bg-zinc-400',
  DOING: 'bg-sky-500',
  REVIEW: 'bg-amber-500',
  DONE: 'bg-emerald-500',
}

export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export const priorityLabel: Record<Priority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

export const priorityTone = {
  LOW: 'neutral',
  MEDIUM: 'blue',
  HIGH: 'amber',
  URGENT: 'red',
} as const satisfies Record<Priority, string>

export const projectStatusLabel: Record<ProjectStatus, string> = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  DONE: 'Concluído',
}

export const projectStatusTone = {
  ACTIVE: 'green',
  PAUSED: 'amber',
  DONE: 'neutral',
} as const satisfies Record<ProjectStatus, string>

// Static class names so Tailwind can see them at build time.
export const PROJECT_COLORS = {
  violet: { dot: 'bg-violet-500', soft: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500' },
  sky: { dot: 'bg-sky-500', soft: 'bg-sky-50 text-sky-700', bar: 'bg-sky-500' },
  emerald: { dot: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  amber: { dot: 'bg-amber-500', soft: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
  rose: { dot: 'bg-rose-500', soft: 'bg-rose-50 text-rose-700', bar: 'bg-rose-500' },
  zinc: { dot: 'bg-zinc-500', soft: 'bg-zinc-100 text-zinc-700', bar: 'bg-zinc-500' },
} as const

export type ProjectColor = keyof typeof PROJECT_COLORS

export function projectColor(color: string) {
  return PROJECT_COLORS[(color in PROJECT_COLORS ? color : 'violet') as ProjectColor]
}
