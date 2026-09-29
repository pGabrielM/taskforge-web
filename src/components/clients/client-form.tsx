'use client'

import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui/input'
import { saveClient } from '@/lib/actions'
import { useAction } from '@/lib/use-action'

type ClientValues = { id: string; name: string; company: string | null; email: string | null; phone: string | null }

export function ClientForm({ client }: { client?: ClientValues }) {
  const [open, setOpen] = useState(false)
  const { pending, run } = useAction()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {client ? (
          <Button variant="ghost" size="icon" aria-label="Editar cliente">
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus /> Novo cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={client ? 'Editar cliente' : 'Novo cliente'}>
        <form
          className="space-y-4"
          action={(formData) =>
            run(() => saveClient(client?.id ?? null, formData), {
              success: client ? 'Cliente atualizado.' : 'Cliente cadastrado.',
              onSuccess: () => setOpen(false),
            })
          }
        >
          <div>
            <Label htmlFor="name">Nome do contato</Label>
            <Input id="name" name="name" defaultValue={client?.name} required />
          </div>
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" name="company" defaultValue={client?.company ?? ''} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" defaultValue={client?.email ?? ''} />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" defaultValue={client?.phone ?? ''} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
