'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/session'
import { PROJECT_COLORS, PRIORITIES, TASK_STATUSES } from '@/lib/constants'

export type ActionResult = { ok: true } | { ok: false; error: string }

const fail = (error: string): ActionResult => ({ ok: false, error })

const optionalDate = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(`${value}T12:00:00`) : null))

const optionalText = z
  .string()
  .trim()
  .max(4000)
  .optional()
  .transform((value) => value || null)

async function ownedProject(userId: string, projectId: string) {
  return prisma.project.findFirst({ where: { id: projectId, ownerId: userId } })
}

async function ownedTask(userId: string, taskId: string) {
  return prisma.task.findFirst({ where: { id: taskId, project: { ownerId: userId } } })
}

function revalidateApp(projectId?: string) {
  revalidatePath('/app', 'layout')
  if (projectId) revalidatePath(`/app/projects/${projectId}`)
}

/* ---------------------------------- Projects --------------------------------- */

const projectSchema = z.object({
  name: z.string().trim().min(2, 'Dê um nome ao projeto.').max(80),
  description: optionalText,
  clientId: z
    .string()
    .optional()
    .transform((value) => value || null),
  color: z.enum(Object.keys(PROJECT_COLORS) as [string, ...string[]]).default('violet'),
  status: z.enum(['ACTIVE', 'PAUSED', 'DONE']).default('ACTIVE'),
  dueDate: optionalDate,
  hourlyRate: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value.replace(',', '.')) : null))
    .refine((value) => value === null || (Number.isFinite(value) && value >= 0), 'Valor/hora inválido.'),
})

async function validClientId(userId: string, clientId: string | null) {
  if (!clientId) return null
  const client = await prisma.client.findFirst({ where: { id: clientId, ownerId: userId } })
  return client?.id ?? null
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  const parsed = projectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fail(parsed.error.issues[0]!.message)

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      clientId: await validClientId(user.id, parsed.data.clientId),
      ownerId: user.id,
    },
  })
  revalidateApp()
  redirect(`/app/projects/${project.id}`)
}

export async function updateProject(projectId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  if (!(await ownedProject(user.id, projectId))) return fail('Projeto não encontrado.')
  const parsed = projectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fail(parsed.error.issues[0]!.message)

  await prisma.project.update({
    where: { id: projectId },
    data: { ...parsed.data, clientId: await validClientId(user.id, parsed.data.clientId) },
  })
  revalidateApp(projectId)
  return { ok: true }
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const user = await requireUser()
  if (!(await ownedProject(user.id, projectId))) return fail('Projeto não encontrado.')
  await prisma.project.delete({ where: { id: projectId } })
  revalidateApp()
  redirect('/app/projects')
}

export async function setProjectSharing(projectId: string, enabled: boolean): Promise<ActionResult> {
  const user = await requireUser()
  if (!(await ownedProject(user.id, projectId))) return fail('Projeto não encontrado.')
  await prisma.project.update({
    where: { id: projectId },
    data: { shareToken: enabled ? randomBytes(12).toString('base64url') : null },
  })
  revalidateApp(projectId)
  return { ok: true }
}

/* ---------------------------------- Clients ---------------------------------- */

const clientSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do cliente.').max(80),
  company: optionalText,
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine((value) => value === null || z.email().safeParse(value).success, 'E-mail inválido.'),
  phone: optionalText,
})

export async function saveClient(clientId: string | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  const parsed = clientSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fail(parsed.error.issues[0]!.message)

  if (clientId) {
    const updated = await prisma.client.updateMany({
      where: { id: clientId, ownerId: user.id },
      data: parsed.data,
    })
    if (updated.count === 0) return fail('Cliente não encontrado.')
  } else {
    await prisma.client.create({ data: { ...parsed.data, ownerId: user.id } })
  }
  revalidateApp()
  return { ok: true }
}

export async function deleteClient(clientId: string): Promise<ActionResult> {
  const user = await requireUser()
  await prisma.client.deleteMany({ where: { id: clientId, ownerId: user.id } })
  revalidateApp()
  return { ok: true }
}

/* ----------------------------------- Tasks ----------------------------------- */

const taskSchema = z.object({
  title: z.string().trim().min(2, 'Descreva a tarefa.').max(160),
  description: optionalText,
  status: z.enum(TASK_STATUSES as [string, ...string[]]).default('TODO'),
  priority: z.enum(PRIORITIES as [string, ...string[]]).default('MEDIUM'),
  dueDate: optionalDate,
  estimateHours: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value.replace(',', '.')) : null))
    .refine((value) => value === null || (Number.isFinite(value) && value >= 0 && value <= 999), 'Estimativa inválida.'),
  clientVisible: z
    .string()
    .optional()
    .transform((value) => value === 'on'),
})

type TaskInput = z.infer<typeof taskSchema>

function statusFields(status: string, previous?: string | null) {
  if (status === 'DONE' && previous !== 'DONE') return { completedAt: new Date() }
  if (status !== 'DONE') return { completedAt: null }
  return {}
}

export async function createTask(projectId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  if (!(await ownedProject(user.id, projectId))) return fail('Projeto não encontrado.')
  const parsed = taskSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fail(parsed.error.issues[0]!.message)
  const data = parsed.data as TaskInput & { status: 'TODO' | 'DOING' | 'REVIEW' | 'DONE'; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }

  const last = await prisma.task.findFirst({
    where: { projectId, status: data.status },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  await prisma.task.create({
    data: {
      ...data,
      projectId,
      position: (last?.position ?? 0) + 1,
      ...statusFields(data.status),
    },
  })
  revalidateApp(projectId)
  return { ok: true }
}

export async function updateTask(taskId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  const task = await ownedTask(user.id, taskId)
  if (!task) return fail('Tarefa não encontrada.')
  const parsed = taskSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fail(parsed.error.issues[0]!.message)
  const data = parsed.data as TaskInput & { status: 'TODO' | 'DOING' | 'REVIEW' | 'DONE'; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }

  await prisma.task.update({
    where: { id: taskId },
    data: { ...data, ...statusFields(data.status, task.status) },
  })
  revalidateApp(task.projectId)
  return { ok: true }
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const user = await requireUser()
  const task = await ownedTask(user.id, taskId)
  if (!task) return fail('Tarefa não encontrada.')
  await prisma.task.delete({ where: { id: taskId } })
  revalidateApp(task.projectId)
  return { ok: true }
}

const moveSchema = z.object({
  taskId: z.string(),
  status: z.enum(['TODO', 'DOING', 'REVIEW', 'DONE']),
  position: z.number().finite(),
})

export async function moveTask(input: z.input<typeof moveSchema>): Promise<ActionResult> {
  const user = await requireUser()
  const parsed = moveSchema.safeParse(input)
  if (!parsed.success) return fail('Movimento inválido.')
  const task = await ownedTask(user.id, parsed.data.taskId)
  if (!task) return fail('Tarefa não encontrada.')

  await prisma.task.update({
    where: { id: task.id },
    data: {
      status: parsed.data.status,
      position: parsed.data.position,
      ...statusFields(parsed.data.status, task.status),
    },
  })
  revalidateApp(task.projectId)
  return { ok: true }
}

/* ------------------------------- Time tracking ------------------------------- */

async function stopRunning(userId: string) {
  const running = await prisma.timeEntry.findFirst({ where: { userId, endedAt: null } })
  if (!running) return
  const endedAt = new Date()
  const minutes = Math.max(1, Math.round((endedAt.getTime() - running.startedAt.getTime()) / 60000))
  await prisma.timeEntry.update({ where: { id: running.id }, data: { endedAt, minutes } })
}

export async function startTimer(taskId: string): Promise<ActionResult> {
  const user = await requireUser()
  const task = await ownedTask(user.id, taskId)
  if (!task) return fail('Tarefa não encontrada.')
  await stopRunning(user.id)
  await prisma.timeEntry.create({ data: { taskId, userId: user.id, startedAt: new Date() } })
  if (task.status === 'TODO') {
    await prisma.task.update({ where: { id: taskId }, data: { status: 'DOING' } })
  }
  revalidateApp(task.projectId)
  return { ok: true }
}

export async function stopTimer(): Promise<ActionResult> {
  const user = await requireUser()
  await stopRunning(user.id)
  revalidateApp()
  return { ok: true }
}

const manualTimeSchema = z.object({
  hours: z.coerce.number().min(0).max(24),
  minutes: z.coerce.number().min(0).max(59),
  date: z.string().min(1, 'Informe a data.'),
  note: optionalText,
})

export async function logTime(taskId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  const task = await ownedTask(user.id, taskId)
  if (!task) return fail('Tarefa não encontrada.')
  const parsed = manualTimeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fail(parsed.error.issues[0]!.message)

  const minutes = parsed.data.hours * 60 + parsed.data.minutes
  if (minutes < 1) return fail('Informe um tempo maior que zero.')
  const startedAt = new Date(`${parsed.data.date}T09:00:00`)
  await prisma.timeEntry.create({
    data: {
      taskId,
      userId: user.id,
      startedAt,
      endedAt: new Date(startedAt.getTime() + minutes * 60000),
      minutes,
      note: parsed.data.note,
    },
  })
  revalidateApp(task.projectId)
  return { ok: true }
}

export async function deleteTimeEntry(entryId: string): Promise<ActionResult> {
  const user = await requireUser()
  await prisma.timeEntry.deleteMany({ where: { id: entryId, userId: user.id } })
  revalidateApp()
  return { ok: true }
}
