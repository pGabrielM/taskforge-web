import { CalendarDays, Clock, FolderKanban, Globe } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ProgressBar } from '@/components/progress-bar'
import { ProjectForm } from '@/components/projects/project-form'
import { PageHeader } from '@/components/shell/page-header'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { projectColor, projectStatusLabel, projectStatusTone } from '@/lib/constants'
import { formatDate, formatMinutes } from '@/lib/format'
import { getClientOptions, getProjects } from '@/lib/queries'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Projetos' }

export default async function ProjectsPage() {
  const user = await requireUser()
  const [projects, clients] = await Promise.all([getProjects(user.id), getClientOptions(user.id)])

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Projetos"
        description="Tudo o que está em andamento, pausado ou entregue."
        actions={<ProjectForm clients={clients} />}
      />
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Nenhum projeto ainda"
          description="Crie o primeiro projeto para organizar tarefas, horas e o portal do cliente."
          action={<ProjectForm clients={clients} />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const color = projectColor(project.color)
            return (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}`}
                className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`size-2.5 shrink-0 rounded-full ${color.dot}`} />
                    <h2 className="truncate font-semibold text-zinc-900 group-hover:text-brand-700">{project.name}</h2>
                  </div>
                  <Badge tone={projectStatusTone[project.status]}>{projectStatusLabel[project.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{project.client?.name ?? 'Projeto interno'}</p>
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
                    <span>
                      {project.progress.done}/{project.progress.total} tarefas
                    </span>
                    <span className="font-medium text-zinc-700">{project.progress.percent}%</span>
                  </div>
                  <ProgressBar percent={project.progress.percent} barClassName={color.bar} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" /> {formatMinutes(project.minutes)}
                  </span>
                  {project.dueDate && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" /> {formatDate(project.dueDate)}
                    </span>
                  )}
                  {project.shareToken && (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <Globe className="size-3.5" /> Portal ativo
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
