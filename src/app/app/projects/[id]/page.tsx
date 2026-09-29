import { ArrowLeft, CalendarDays, Clock, Wallet } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Board } from '@/components/board/board'
import { ConfirmButton } from '@/components/confirm-button'
import { ProgressBar } from '@/components/progress-bar'
import { ProjectForm } from '@/components/projects/project-form'
import { SharePanel } from '@/components/projects/share-panel'
import { Badge } from '@/components/ui/badge'
import { deleteProject } from '@/lib/actions'
import { projectColor, projectStatusLabel, projectStatusTone } from '@/lib/constants'
import { currency, formatDate, formatMinutes } from '@/lib/format'
import { getClientOptions, getProject, getRunningTimer } from '@/lib/queries'
import { requireUser } from '@/lib/session'

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const user = await requireUser()
  const project = await getProject(user.id, (await params).id)
  return { title: project?.name ?? 'Projeto' }
}

export default async function ProjectPage({ params }: Params) {
  const user = await requireUser()
  const { id } = await params
  const [project, clients, running] = await Promise.all([
    getProject(user.id, id),
    getClientOptions(user.id),
    getRunningTimer(user.id),
  ])
  if (!project) notFound()
  const color = projectColor(project.color)

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link href="/app/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="size-4" /> Projetos
      </Link>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`size-3 rounded-full ${color.dot}`} />
            <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
            <Badge tone={projectStatusTone[project.status]}>{projectStatusLabel[project.status]}</Badge>
          </div>
          {project.description && <p className="mt-1 max-w-2xl text-sm text-zinc-500">{project.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-600">
            {project.client && <span>Cliente: <strong className="font-medium text-zinc-800">{project.client.name}</strong></span>}
            {project.dueDate && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 text-zinc-400" /> Prazo {formatDate(project.dueDate, "d 'de' MMMM")}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-zinc-400" /> {formatMinutes(project.minutes)} registradas
            </span>
            {project.hourlyRate !== null && (
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="size-4 text-zinc-400" />
                {currency.format((project.minutes / 60) * project.hourlyRate)} a faturar
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <SharePanel projectId={project.id} shareToken={project.shareToken} />
          <ProjectForm clients={clients} project={project} />
          <ConfirmButton
            compact
            title="Excluir projeto?"
            description="Todas as tarefas e horas do projeto serão apagadas. Essa ação não pode ser desfeita."
            action={deleteProject.bind(null, project.id)}
          />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <ProgressBar percent={project.progress.percent} className="h-2 max-w-md flex-1" barClassName={color.bar} />
        <span className="text-sm text-zinc-600">
          {project.progress.done}/{project.progress.total} tarefas · {project.progress.percent}%
        </span>
      </div>

      <Board projectId={project.id} initialTasks={project.tasks} runningTaskId={running?.taskId ?? null} />
    </div>
  )
}
