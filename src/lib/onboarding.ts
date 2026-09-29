import 'server-only'

import { addDays } from 'date-fns'
import { prisma } from '@/lib/prisma'

// Gives brand-new accounts something to look at instead of an empty screen.
export async function onUserCreated(userId: string, name: string): Promise<void> {
  const client = await prisma.client.create({
    data: { ownerId: userId, name: 'Cliente exemplo', company: 'Empresa Exemplo Ltda.' },
  })

  await prisma.project.create({
    data: {
      ownerId: userId,
      clientId: client.id,
      name: `Primeiro projeto de ${name.split(' ')[0]}`,
      description: 'Arraste os cards entre as colunas, abra uma tarefa e inicie o timer.',
      color: 'violet',
      dueDate: addDays(new Date(), 21),
      tasks: {
        create: [
          { title: 'Reunião de kickoff com o cliente', status: 'DONE', position: 1, completedAt: new Date() },
          { title: 'Levantar requisitos', status: 'DOING', priority: 'HIGH', position: 1 },
          { title: 'Enviar proposta de escopo', status: 'TODO', priority: 'HIGH', position: 1, dueDate: addDays(new Date(), 2) },
          { title: 'Definir identidade visual', status: 'TODO', position: 2 },
        ],
      },
    },
  })
}
