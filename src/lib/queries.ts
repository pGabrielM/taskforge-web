import 'server-only'

import { endOfDay, startOfDay, startOfWeek, subDays } from 'date-fns'
import { prisma } from '@/lib/prisma'

export async function getRunningTimer(userId: string) {
  return prisma.timeEntry.findFirst({
    where: { userId, endedAt: null },
    include: { task: { select: { id: true, title: true, project: { select: { id: true, name: true } } } } },
  })
}

function progressOf(tasks: { status: string }[]) {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'DONE').length
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export async function getDashboard(userId: string) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const since = startOfDay(subDays(now, 13))

  const [openTasks, overdue, doneThisWeek, weekEntries, projects, upcoming, recentDone, entries] =
    await Promise.all([
      prisma.task.count({ where: { project: { ownerId: userId }, status: { not: 'DONE' } } }),
      prisma.task.count({
        where: { project: { ownerId: userId }, status: { not: 'DONE' }, dueDate: { lt: startOfDay(now) } },
      }),
      prisma.task.count({
        where: { project: { ownerId: userId }, status: 'DONE', completedAt: { gte: weekStart } },
      }),
      prisma.timeEntry.aggregate({
        where: { userId, startedAt: { gte: weekStart } },
        _sum: { minutes: true },
      }),
      prisma.project.findMany({
        where: { ownerId: userId, status: 'ACTIVE' },
        include: { client: { select: { name: true } }, tasks: { select: { status: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 6,
      }),
      prisma.task.findMany({
        where: {
          project: { ownerId: userId },
          status: { not: 'DONE' },
          dueDate: { lte: endOfDay(subDays(now, -7)) },
        },
        include: { project: { select: { id: true, name: true, color: true } } },
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
        take: 8,
      }),
      prisma.task.findMany({
        where: { project: { ownerId: userId }, status: 'DONE', completedAt: { not: null } },
        include: { project: { select: { id: true, name: true, color: true } } },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
      prisma.timeEntry.findMany({
        where: { userId, startedAt: { gte: since } },
        select: { startedAt: true, minutes: true },
      }),
    ])

  const days = Array.from({ length: 14 }, (_, index) => {
    const day = startOfDay(subDays(now, 13 - index))
    const minutes = entries
      .filter((entry) => startOfDay(entry.startedAt).getTime() === day.getTime())
      .reduce((sum, entry) => sum + entry.minutes, 0)
    return { day, minutes }
  })

  return {
    stats: {
      openTasks,
      overdue,
      doneThisWeek,
      weekMinutes: weekEntries._sum.minutes ?? 0,
    },
    projects: projects.map((project) => ({ ...project, progress: progressOf(project.tasks) })),
    upcoming,
    recentDone,
    days,
  }
}

export async function getProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    include: {
      client: { select: { id: true, name: true } },
      tasks: { select: { status: true, timeEntries: { select: { minutes: true } } } },
    },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
  })

  return projects.map(({ tasks, ...project }) => ({
    ...project,
    hourlyRate: project.hourlyRate ? Number(project.hourlyRate) : null,
    progress: progressOf(tasks),
    minutes: tasks.flatMap((task) => task.timeEntries).reduce((sum, entry) => sum + entry.minutes, 0),
  }))
}

export async function getProject(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    include: {
      client: true,
      tasks: {
        orderBy: { position: 'asc' },
        include: { timeEntries: { select: { minutes: true } } },
      },
    },
  })
  if (!project) return null

  const tasks = project.tasks.map(({ timeEntries, ...task }) => ({
    ...task,
    minutes: timeEntries.reduce((sum, entry) => sum + entry.minutes, 0),
  }))

  return {
    ...project,
    hourlyRate: project.hourlyRate ? Number(project.hourlyRate) : null,
    tasks,
    progress: progressOf(tasks),
    minutes: tasks.reduce((sum, task) => sum + task.minutes, 0),
  }
}

export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProject>>>
export type BoardTask = ProjectDetail['tasks'][number]

export async function getClients(userId: string) {
  const clients = await prisma.client.findMany({
    where: { ownerId: userId },
    include: { projects: { select: { id: true, name: true, status: true, color: true } } },
    orderBy: { name: 'asc' },
  })
  return clients
}

export async function getClientOptions(userId: string) {
  return prisma.client.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export async function getTimeReport(userId: string, from: Date, to: Date) {
  const entries = await prisma.timeEntry.findMany({
    where: { userId, startedAt: { gte: from, lte: to }, endedAt: { not: null } },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          project: {
            select: { id: true, name: true, color: true, hourlyRate: true, client: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  })

  const byProject = new Map<
    string,
    { id: string; name: string; color: string; client: string | null; minutes: number; amount: number | null }
  >()
  for (const entry of entries) {
    const project = entry.task.project
    const rate = project.hourlyRate ? Number(project.hourlyRate) : null
    const current = byProject.get(project.id) ?? {
      id: project.id,
      name: project.name,
      color: project.color,
      client: project.client?.name ?? null,
      minutes: 0,
      amount: rate === null ? null : 0,
    }
    current.minutes += entry.minutes
    if (rate !== null) current.amount = (current.amount ?? 0) + (entry.minutes / 60) * rate
    byProject.set(project.id, current)
  }

  return {
    entries,
    byProject: [...byProject.values()].sort((a, b) => b.minutes - a.minutes),
    totalMinutes: entries.reduce((sum, entry) => sum + entry.minutes, 0),
  }
}

export async function getSharedProject(token: string) {
  const project = await prisma.project.findUnique({
    where: { shareToken: token },
    include: {
      client: { select: { name: true, company: true } },
      owner: { select: { name: true } },
      tasks: {
        where: { clientVisible: true },
        orderBy: [{ status: 'asc' }, { position: 'asc' }],
        select: { id: true, title: true, status: true, dueDate: true, completedAt: true, updatedAt: true },
      },
    },
  })
  if (!project) return null
  return { ...project, progress: progressOf(project.tasks) }
}
