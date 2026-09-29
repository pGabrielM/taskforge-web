'use client'

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { moveTask } from '@/lib/actions'
import { TASK_STATUSES, taskStatusDot, taskStatusLabel } from '@/lib/constants'
import type { BoardTask } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { TaskCard, TaskCardBody } from './task-card'
import { TaskDialog } from './task-dialog'

type Status = BoardTask['status']

function Column({
  status,
  tasks,
  runningTaskId,
  onOpen,
  onCreate,
}: {
  status: Status
  tasks: BoardTask[]
  runningTaskId: string | null
  onOpen: (task: BoardTask) => void
  onCreate: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-zinc-100/70 lg:w-auto lg:min-w-0 lg:flex-1">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className={cn('size-2 rounded-full', taskStatusDot[status])} />
        <h2 className="text-sm font-semibold text-zinc-800">{taskStatusLabel[status]}</h2>
        <span className="text-xs text-zinc-500">{tasks.length}</span>
        <button
          onClick={onCreate}
          className="ml-auto rounded-md p-1 text-zinc-400 hover:bg-white hover:text-zinc-700"
          aria-label={`Nova tarefa em ${taskStatusLabel[status]}`}
        >
          <Plus className="size-4" />
        </button>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn('flex min-h-32 flex-1 flex-col gap-2 rounded-b-xl p-2 transition-colors', isOver && 'bg-brand-50')}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} running={task.id === runningTaskId} onOpen={() => onOpen(task)} />
          ))}
          {tasks.length === 0 && (
            <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-6 text-center text-xs text-zinc-400">
              Arraste tarefas para cá
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function Board({
  projectId,
  initialTasks,
  runningTaskId,
}: {
  projectId: string
  initialTasks: BoardTask[]
  runningTaskId: string | null
}) {
  const [tasks, setTasks] = useState(initialTasks)
  const [source, setSource] = useState(initialTasks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState<Status | null>(null)
  const [, startTransition] = useTransition()

  // Re-sync when the server sends fresh data (after any mutation / revalidation).
  if (source !== initialTasks) {
    setSource(initialTasks)
    setTasks(initialTasks)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const columns = useMemo(() => {
    const byStatus = Object.fromEntries(TASK_STATUSES.map((status) => [status, [] as BoardTask[]])) as Record<Status, BoardTask[]>
    for (const task of [...tasks].sort((a, b) => a.position - b.position)) byStatus[task.status].push(task)
    return byStatus
  }, [tasks])

  const columnOf = (id: string): Status | undefined =>
    (TASK_STATUSES as string[]).includes(id) ? (id as Status) : tasks.find((task) => task.id === id)?.status

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const from = columnOf(String(active.id))
    const to = columnOf(String(over.id))
    if (!from || !to || from === to) return
    setTasks((previous) => previous.map((task) => (task.id === active.id ? { ...task, status: to } : task)))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return
    const to = columnOf(String(over.id))
    if (!to) return

    const column = columns[to]
    const oldIndex = column.findIndex((task) => task.id === active.id)
    const overIndex = column.findIndex((task) => task.id === over.id)
    const newIndex = overIndex === -1 ? column.length - 1 : overIndex
    const ordered = oldIndex === -1 ? column : arrayMove(column, oldIndex, newIndex)
    const index = ordered.findIndex((task) => task.id === active.id)
    const before = ordered[index - 1]?.position
    const after = ordered[index + 1]?.position
    const position =
      before === undefined && after === undefined
        ? 1
        : before === undefined
          ? after! - 1
          : after === undefined
            ? before + 1
            : (before + after) / 2

    const original = initialTasks.find((task) => task.id === active.id)
    if (original && original.status === to && original.position === position) return

    setTasks((previous) =>
      previous.map((task) =>
        task.id === active.id ? { ...task, status: to, position, completedAt: to === 'DONE' ? new Date() : null } : task,
      ),
    )
    startTransition(async () => {
      const result = await moveTask({ taskId: String(active.id), status: to, position })
      if (!result.ok) {
        toast.error(result.error)
        setTasks(initialTasks)
      }
    })
  }

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null
  const editing = editingId ? (tasks.find((task) => task.id === editingId) ?? null) : null

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveId(null)
          setTasks(initialTasks)
        }}
      >
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          {TASK_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={columns[status]}
              runningTaskId={runningTaskId}
              onOpen={(task) => setEditingId(task.id)}
              onCreate={() => setCreating(status)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl">
              <TaskCardBody task={activeTask} running={activeTask.id === runningTaskId} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        key={editing?.id ?? 'none'}
        projectId={projectId}
        open={!!editing}
        onOpenChange={(open) => !open && setEditingId(null)}
        task={editing ?? undefined}
        running={!!editing && editing.id === runningTaskId}
      />
      <TaskDialog
        key={`new-${creating}`}
        projectId={projectId}
        open={!!creating}
        onOpenChange={(open) => !open && setCreating(null)}
        defaultStatus={creating ?? 'TODO'}
        running={false}
      />
    </>
  )
}
