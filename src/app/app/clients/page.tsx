import { Building2, Mail, Phone, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ClientForm } from '@/components/clients/client-form'
import { ConfirmButton } from '@/components/confirm-button'
import { PageHeader } from '@/components/shell/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { deleteClient } from '@/lib/actions'
import { projectColor } from '@/lib/constants'
import { getClients } from '@/lib/queries'
import { requireUser } from '@/lib/session'
import { initials } from '@/lib/utils'

export const metadata: Metadata = { title: 'Clientes' }

export default async function ClientsPage() {
  const user = await requireUser()
  const clients = await getClients(user.id)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Clientes" description="Contatos e projetos de cada cliente." actions={<ClientForm />} />
      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente" description="Cadastre clientes para vincular projetos e compartilhar o andamento." action={<ClientForm />} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <div key={client.id} className="forge-card p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {initials(client.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{client.name}</h2>
                  {client.company && (
                    <p className="flex items-center gap-1 truncate text-sm text-zinc-500">
                      <Building2 className="size-3.5" /> {client.company}
                    </p>
                  )}
                </div>
                <div className="flex">
                  <ClientForm client={client} />
                  <ConfirmButton
                    compact
                    title="Excluir cliente?"
                    description="Os projetos continuam existindo, apenas sem cliente vinculado."
                    action={deleteClient.bind(null, client.id)}
                    success="Cliente excluído."
                  />
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-zinc-600">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 hover:text-zinc-900">
                    <Mail className="size-4 text-zinc-400" /> {client.email}
                  </a>
                )}
                {client.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 text-zinc-400" /> {client.phone}
                  </p>
                )}
              </div>
              <div className="mt-4 border-t border-zinc-100 pt-3">
                <p className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                  {client.projects.length} {client.projects.length === 1 ? 'projeto' : 'projetos'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {client.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/app/projects/${project.id}`}
                      className={`rounded-md px-2 py-0.5 text-xs font-medium hover:opacity-80 ${projectColor(project.color).soft}`}
                    >
                      {project.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
