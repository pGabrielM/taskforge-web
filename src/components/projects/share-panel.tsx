'use client'

import { Check, Copy, Globe, Lock } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { setProjectSharing } from '@/lib/actions'
import { useAction } from '@/lib/use-action'

export function SharePanel({ projectId, shareToken }: { projectId: string; shareToken: string | null }) {
  const { pending, run } = useAction()
  const [copied, setCopied] = useState(false)
  const url = shareToken
    ? `${typeof window === 'undefined' ? '' : window.location.origin}/share/${shareToken}`
    : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          {shareToken ? <Globe className="text-emerald-600" /> : <Lock />}
          Portal do cliente
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Portal do cliente"
        description="Um link somente leitura para o cliente acompanhar o andamento, sem precisar de login. Tarefas marcadas como ocultas não aparecem."
      >
        {url ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                className="h-9 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 font-mono text-xs text-zinc-700"
                onFocus={(event) => event.target.select()}
              />
              <Button
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(url)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
              >
                {copied ? <Check /> : <Copy />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
            <div className="flex justify-between gap-2">
              <Button
                variant="ghost"
                className="text-red-600"
                disabled={pending}
                onClick={() => run(() => setProjectSharing(projectId, false), { success: 'Link desativado.' })}
              >
                Desativar link
              </Button>
              <Button asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  Abrir portal
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className="w-full"
            disabled={pending}
            onClick={() => run(() => setProjectSharing(projectId, true), { success: 'Link criado.' })}
          >
            <Globe /> Gerar link de acompanhamento
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
