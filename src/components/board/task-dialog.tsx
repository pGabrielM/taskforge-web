'use client'

import { Clock, Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { ConfirmButton } from '@/components/confirm-button'
import { createTask, deleteTask, logTime, startTimer, stopTimer, updateTask } from '@/lib/actions'
import { PRIORITIES, TASK_STATUSES, priorityLabel, taskStatusLabel } from '@/lib/constants'
import { formatMinutes } from '@/lib/format'
import type { BoardTask } from '@/lib/queries'
import { useAction } from '@/lib/use-action'

type Props = {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: BoardTask
  defaultStatus?: BoardTask['status']
  running: boolean
}

export function TaskDialog({ projectId, open, onOpenChange, task, defaultStatus = 'TODO', running }: Props) {
  const { pending, run } = useAction()
  const [showLog, setShowLog] = useState(false)
  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={task ? 'Editar tarefa' : 'Nova tarefa'} className="max-w-xl">
        {task && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <Clock className="size-4 text-zinc-400" />
            <span className="text-sm text-zinc-600">
              <strong className="font-semibold text-zinc-900">{formatMinutes(task.minutes)}</strong> registradas
              {task.estimateHours ? ` de ${task.estimateHours}h estimadas` : ''}
            </span>
            <div className="ml-auto flex gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => setShowLog((value) => !value)}>
                Lançar horas
              </Button>
              {running ? (
                <Button type="button" size="sm" variant="dark" disabled={pending} onClick={() => run(() => stopTimer(), { success: 'Timer parado.' })}>
                  <Pause /> Parar
                </Button>
              ) : (
                <Button type="button" size="sm" disabled={pending} onClick={() => run(() => startTimer(task.id), { success: 'Timer iniciado.' })}>
                  <Play /> Iniciar timer
                </Button>
              )}
            </div>
            {showLog && (
              <form
                className="grid w-full grid-cols-2 gap-2 border-t border-zinc-200 pt-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]"
                action={(formData) =>
                  run(() => logTime(task.id, formData), { success: 'Horas lançadas.', onSuccess: () => setShowLog(false) })
                }
              >
                <Input name="hours" type="number" min={0} max={24} defaultValue={1} aria-label="Horas" />
                <Input name="minutes" type="number" min={0} max={59} defaultValue={0} aria-label="Minutos" />
                <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} aria-label="Data" />
                <Button type="submit" size="sm" className="h-9" disabled={pending}>
                  Salvar
                </Button>
              </form>
            )}
          </div>
        )}

        <form
          className="space-y-4"
          action={(formData) =>
            run(() => (task ? updateTask(task.id, formData) : createTask(projectId, formData)), {
              success: task ? 'Tarefa atualizada.' : 'Tarefa criada.',
              onSuccess: close,
            })
          }
        >
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={task?.title} required autoFocus={!task} />
          </div>
          <div>
            <Label htmlFor="description">Detalhes</Label>
            <Textarea id="description" name="description" defaultValue={task?.description ?? ''} rows={4} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={task?.status ?? defaultStatus}>
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {taskStatusLabel[status]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select id="priority" name="priority" defaultValue={task?.priority ?? 'MEDIUM'}>
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabel[priority]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Prazo</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''}
              />
            </div>
            <div>
              <Label htmlFor="estimateHours">Estimativa (h)</Label>
              <Input id="estimateHours" name="estimateHours" inputMode="decimal" defaultValue={task?.estimateHours ?? ''} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              name="clientVisible"
              defaultChecked={task?.clientVisible ?? true}
              className="size-4 rounded border-zinc-300 accent-brand-600"
            />
            Visível no portal do cliente
          </label>
          <div className="flex items-center justify-between gap-2 pt-2">
            {task ? (
              <ConfirmButton
                title="Excluir tarefa?"
                description="As horas registradas nela também serão removidas."
                action={async () => {
                  const result = await deleteTask(task.id)
                  if (result.ok) close()
                  return result
                }}
                success="Tarefa excluída."
              />
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={close}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Salvando…' : task ? 'Salvar' : 'Criar tarefa'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
