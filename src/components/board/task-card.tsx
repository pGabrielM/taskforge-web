'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays, Clock, EyeOff, Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { priorityLabel, priorityTone } from '@/lib/constants'
import { dueState, formatDate, formatMinutes } from '@/lib/format'
import type { BoardTask } from '@/lib/queries'
import { cn } from '@/lib/utils'

export function TaskCardBody({ task, running }: { task: BoardTask; running: boolean }) {
  const due = dueState(task.dueDate, task.status === 'DONE')
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-sm font-medium text-zinc-900', task.status === 'DONE' && 'text-zinc-500 line-through')}>
          {task.title}
        </p>
        {running && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <Timer className="size-3 animate-pulse" /> REC
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone={priorityTone[task.priority]}>{priorityLabel[task.priority]}</Badge>
        {task.dueDate && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs',
              due === 'overdue' ? 'font-medium text-red-600' : due === 'today' ? 'font-medium text-amber-600' : 'text-zinc-500',
            )}
          >
            <CalendarDays className="size-3.5" />
            {due === 'today' ? 'Hoje' : formatDate(task.dueDate)}
          </span>
        )}
        {(task.minutes > 0 || task.estimateHours) && (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="size-3.5" />
            {formatMinutes(task.minutes)}
            {task.estimateHours ? ` / ${task.estimateHours}h` : ''}
          </span>
        )}
        {!task.clientVisible && <EyeOff className="size-3.5 text-zinc-400" aria-label="Oculta do cliente" />}
      </div>
    </>
  )
}

export function TaskCard({ task, running, onOpen }: { task: BoardTask; running: boolean; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        'cursor-grab rounded-sm border-2 border-zinc-900 bg-white p-3 shadow-[2px_2px_0_0_#211a11] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-forge active:cursor-grabbing',
        isDragging && 'opacity-40',
        running && 'bg-brand-50',
      )}
    >
      <TaskCardBody task={task} running={running} />
    </div>
  )
}
