import { CheckCircle2, Circle, CircleDot, Eye } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Logo } from '@/components/logo'
import { ProgressBar } from '@/components/progress-bar'
import { TASK_STATUSES, taskStatusLabel } from '@/lib/constants'
import { formatDate, relative } from '@/lib/format'
import { getSharedProject } from '@/lib/queries'
import { siteConfig } from '@/config/site'

type Params = { params: Promise<{ token: string }> }

export const metadata: Metadata = { title: 'Acompanhamento do projeto', robots: { index: false } }

const statusIcon = {
  TODO: <Circle className="size-4 text-zinc-300" />,
  DOING: <CircleDot className="size-4 text-sky-500" />,
  REVIEW: <Eye className="size-4 text-amber-500" />,
  DONE: <CheckCircle2 className="size-4 text-emerald-500" />,
}

export default async function SharedProjectPage({ params }: Params) {
  const project = await getSharedProject((await params).token)
  if (!project) notFound()

  const lastUpdate = project.tasks.reduce<Date | null>(
    (latest, task) => (!latest || task.updatedAt > latest ? task.updatedAt : latest),
    null,
  )
  const order = ['DOING', 'REVIEW', 'TODO', 'DONE'] as const

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo />
          <span className="text-xs text-zinc-500">Portal do cliente · somente leitura</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-zinc-500">
          {project.client ? `${project.client.company ?? project.client.name} · ` : ''}conduzido por {project.owner.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{project.name}</h1>
        {project.description && <p className="mt-2 text-zinc-600">{project.description}</p>}

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-semibold tracking-tight tabular-nums">{project.progress.percent}%</p>
              <p className="text-sm text-zinc-500">
                {project.progress.done} de {project.progress.total} entregas concluídas
              </p>
            </div>
            <div className="text-right text-sm text-zinc-500">
              {project.dueDate && <p>Previsão: {formatDate(project.dueDate, "d 'de' MMMM")}</p>}
              {lastUpdate && <p>Atualizado {relative(lastUpdate)}</p>}
            </div>
          </div>
          <ProgressBar percent={project.progress.percent} className="mt-5 h-2.5" />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TASK_STATUSES.map((status) => (
              <div key={status} className="rounded-lg bg-zinc-50 px-3 py-2">
                <p className="text-lg font-semibold tabular-nums">{project.tasks.filter((task) => task.status === status).length}</p>
                <p className="text-xs text-zinc-500">{taskStatusLabel[status]}</p>
              </div>
            ))}
          </div>
        </div>

        {order.map((status) => {
          const tasks = project.tasks.filter((task) => task.status === status)
          if (tasks.length === 0) return null
          return (
            <section key={status} className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-zinc-700">{taskStatusLabel[status]}</h2>
              <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 px-4 py-3">
                    {statusIcon[task.status]}
                    <span className={task.status === 'DONE' ? 'flex-1 text-sm text-zinc-500' : 'flex-1 text-sm text-zinc-900'}>
                      {task.title}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {task.status === 'DONE' && task.completedAt
                        ? `entregue ${formatDate(task.completedAt)}`
                        : task.dueDate
                          ? `prazo ${formatDate(task.dueDate)}`
                          : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}

        <p className="mt-12 text-center text-xs text-zinc-400">
          Gerado com{' '}
          <Link href="/" className="font-medium text-zinc-600 hover:underline">
            {siteConfig.name}
          </Link>
        </p>
      </main>
    </div>
  )
}
