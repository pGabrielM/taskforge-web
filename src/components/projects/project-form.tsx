'use client'

import { Plus, Settings2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { createProject, updateProject } from '@/lib/actions'
import { PROJECT_COLORS, projectStatusLabel } from '@/lib/constants'
import { useAction } from '@/lib/use-action'
import { cn } from '@/lib/utils'

type ProjectValues = {
  id: string
  name: string
  description: string | null
  clientId: string | null
  color: string
  status: 'ACTIVE' | 'PAUSED' | 'DONE'
  dueDate: Date | null
  hourlyRate: number | null
}

export function ProjectForm({
  clients,
  project,
  trigger,
}: {
  clients: { id: string; name: string }[]
  project?: ProjectValues
  trigger?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState(project?.color ?? 'violet')
  const { pending, run } = useAction()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            {project ? <Settings2 /> : <Plus />}
            {project ? 'Configurar' : 'Novo projeto'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        title={project ? 'Configurações do projeto' : 'Novo projeto'}
        description="Projetos agrupam tarefas, horas e o portal do cliente."
      >
        <form
          className="space-y-4"
          action={(formData) =>
            run(() => (project ? updateProject(project.id, formData) : createProject(formData)), {
              success: project ? 'Projeto atualizado.' : undefined,
              onSuccess: () => setOpen(false),
            })
          }
        >
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={project?.name} required placeholder="Ex.: Site institucional" />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description ?? ''}
              placeholder="Escopo, links úteis, combinados com o cliente…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="clientId">Cliente</Label>
              <Select id="clientId" name="clientId" defaultValue={project?.clientId ?? ''}>
                <option value="">Sem cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
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
                defaultValue={project?.dueDate ? new Date(project.dueDate).toISOString().slice(0, 10) : ''}
              />
            </div>
            <div>
              <Label htmlFor="hourlyRate">Valor/hora (R$)</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                inputMode="decimal"
                defaultValue={project?.hourlyRate ?? ''}
                placeholder="Opcional"
              />
            </div>
            {project && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={project.status}>
                  {Object.entries(projectStatusLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <div>
            <span className="field-label">Cor</span>
            <input type="hidden" name="color" value={color} />
            <div className="flex gap-2">
              {Object.entries(PROJECT_COLORS).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  aria-label={key}
                  className={cn(
                    'size-7 rounded-full ring-offset-2 transition',
                    value.dot,
                    color === key ? 'ring-2 ring-zinc-900' : 'hover:scale-110',
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando…' : project ? 'Salvar' : 'Criar projeto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
