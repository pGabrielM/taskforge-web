import { AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ProgressBar } from '@/components/progress-bar'
import { PageHeader } from '@/components/shell/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { priorityLabel, priorityTone, projectColor } from '@/lib/constants'
import { dueState, formatDate, formatMinutes, relative } from '@/lib/format'
import { getDashboard } from '@/lib/queries'
import { requireUser } from '@/lib/session'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Visão geral' }

export default async function DashboardPage() {
  const user = await requireUser()
  const data = await getDashboard(user.id)
  const maxMinutes = Math.max(60, ...data.days.map((day) => day.minutes))
  const totalMinutes = data.days.reduce((sum, day) => sum + day.minutes, 0)
  const activeDays = data.days.filter((day) => day.minutes > 0).length

  const stats = [
    { label: 'Tarefas abertas', value: data.stats.openTasks, icon: ListTodo, tone: 'text-brand-600 bg-brand-50' },
    { label: 'Atrasadas', value: data.stats.overdue, icon: AlertTriangle, tone: 'text-red-600 bg-red-50' },
    { label: 'Concluídas na semana', value: data.stats.doneThisWeek, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Horas na semana', value: formatMinutes(data.stats.weekMinutes), icon: Clock, tone: 'text-sky-600 bg-sky-50' },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={`Olá, ${user.name.split(' ')[0]}`} description="Aqui está o resumo dos seus projetos." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className={cn('mb-3 flex size-8 items-center justify-center rounded-lg', stat.tone)}>
              <stat.icon className="size-4" />
            </div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Prazos próximos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.upcoming.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-zinc-500">Nada vencendo nos próximos 7 dias. 🎉</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {data.upcoming.map((task) => {
                  const due = dueState(task.dueDate, false)
                  return (
                    <li key={task.id}>
                      <Link
                        href={`/app/projects/${task.project.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50"
                      >
                        <span className={`size-2 shrink-0 rounded-full ${projectColor(task.project.color).dot}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900">{task.title}</p>
                          <p className="truncate text-xs text-zinc-500">{task.project.name}</p>
                        </div>
                        <Badge tone={priorityTone[task.priority]} className="hidden sm:inline-flex">
                          {priorityLabel[task.priority]}
                        </Badge>
                        <span
                          className={cn(
                            'w-20 shrink-0 text-right text-xs',
                            due === 'overdue' ? 'font-medium text-red-600' : due === 'today' ? 'font-medium text-amber-600' : 'text-zinc-500',
                          )}
                        >
                          {due === 'overdue' ? 'Atrasada' : due === 'today' ? 'Hoje' : formatDate(task.dueDate)}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horas nos últimos 14 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-1.5">
              {data.days.map(({ day, minutes }) => (
                <div key={day.toISOString()} className="group relative flex h-full flex-1 flex-col justify-end">
                  <div
                    className={cn('rounded-t-sm transition-colors', minutes ? 'bg-brand-500 group-hover:bg-brand-600' : 'bg-zinc-100')}
                    style={{ height: `${Math.max(3, (minutes / maxMinutes) * 100)}%` }}
                  />
                  <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white group-hover:block">
                    {formatDate(day, 'dd/MM')} · {formatMinutes(minutes)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-zinc-400">
              <span>{formatDate(data.days[0]!.day, 'dd/MM')}</span>
              <span>hoje</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4">
              <div>
                <p className="text-lg font-semibold tabular-nums">{formatMinutes(totalMinutes)}</p>
                <p className="text-xs text-zinc-500">Total no período</p>
              </div>
              <div>
                <p className="text-lg font-semibold tabular-nums">{formatMinutes(Math.round(totalMinutes / Math.max(1, activeDays)))}</p>
                <p className="text-xs text-zinc-500">Média por dia trabalhado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Projetos ativos</CardTitle>
            <Link href="/app/projects" className="text-xs font-medium text-brand-700 hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.projects.map((project) => {
              const color = projectColor(project.color)
              return (
                <Link key={project.id} href={`/app/projects/${project.id}`} className="block rounded-lg p-2 -m-2 hover:bg-zinc-50">
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={`size-2 shrink-0 rounded-full ${color.dot}`} />
                      <span className="truncate font-medium">{project.name}</span>
                      {project.client && <span className="hidden truncate text-zinc-400 sm:inline">· {project.client.name}</span>}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">{project.progress.percent}%</span>
                  </div>
                  <ProgressBar percent={project.progress.percent} barClassName={color.bar} />
                </Link>
              )
            })}
            {data.projects.length === 0 && <p className="text-sm text-zinc-500">Nenhum projeto ativo.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entregas recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.recentDone.map((task) => (
                <li key={task.id} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-800">{task.title}</p>
                    <p className="text-xs text-zinc-500">
                      {task.project.name} · {relative(task.completedAt!)}
                    </p>
                  </div>
                </li>
              ))}
              {data.recentDone.length === 0 && <p className="text-sm text-zinc-500">Nenhuma entrega ainda.</p>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
