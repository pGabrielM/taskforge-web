// Seeds (or resets) the public demo account. Safe to run repeatedly.
import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

config({ path: '.env.local', quiet: true })
config({ quiet: true })

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) })
const DEMO = { email: 'demo@taskforge.dev', password: 'demo1234', name: 'Marina Costa' }

const day = 24 * 60 * 60 * 1000
const now = new Date()
const at = (offsetDays, hour = 12) => {
  const date = new Date(now.getTime() + offsetDays * day)
  date.setHours(hour, 0, 0, 0)
  return date
}

async function main() {
  await prisma.user.deleteMany({ where: { email: DEMO.email } })

  const user = await prisma.user.create({
    data: { email: DEMO.email, name: DEMO.name, passwordHash: await bcrypt.hash(DEMO.password, 10) },
  })

  const [padaria, clinica, studio] = await Promise.all([
    prisma.client.create({ data: { ownerId: user.id, name: 'Rafael Lima', company: 'Padaria Pão de Casa', email: 'rafael@paodecasa.com.br', phone: '(41) 99999-1020' } }),
    prisma.client.create({ data: { ownerId: user.id, name: 'Dra. Helena Duarte', company: 'Clínica Bem Viver', email: 'contato@bemviver.med.br', phone: '(41) 98888-3040' } }),
    prisma.client.create({ data: { ownerId: user.id, name: 'Lucas Andrade', company: 'Studio Forma Arquitetura', email: 'lucas@studioforma.arq.br' } }),
  ])

  const projects = [
    {
      name: 'E-commerce Pão de Casa',
      description: 'Loja virtual com encomendas para retirada e entrega no bairro, integrada ao WhatsApp e Pix.',
      clientId: padaria.id,
      color: 'amber',
      dueDate: at(18),
      hourlyRate: 120,
      shareToken: 'demo-pao-de-casa',
      tasks: [
        ['Kickoff e levantamento de requisitos', 'DONE', 'HIGH', -20, 3],
        ['Wireframes das páginas principais', 'DONE', 'MEDIUM', -15, 6],
        ['Catálogo de produtos com categorias', 'DONE', 'HIGH', -8, 10],
        ['Carrinho e checkout com Pix', 'DOING', 'URGENT', 2, 14],
        ['Agendamento de retirada por horário', 'DOING', 'HIGH', 5, 8],
        ['Notificação de pedido via WhatsApp', 'REVIEW', 'HIGH', 1, 5],
        ['Painel de pedidos para a equipe', 'TODO', 'MEDIUM', 9, 10],
        ['Cupons de desconto', 'TODO', 'LOW', 14, 4],
        ['Testes com clientes reais', 'TODO', 'MEDIUM', 16, 4],
        ['Revisar custos de hospedagem', 'TODO', 'LOW', -2, 1, false],
      ],
    },
    {
      name: 'Agendamento online — Clínica Bem Viver',
      description: 'Agenda online por especialidade, com lembrete automático e confirmação de consulta.',
      clientId: clinica.id,
      color: 'emerald',
      dueDate: at(32),
      hourlyRate: 140,
      tasks: [
        ['Mapear fluxo atual de agendamento', 'DONE', 'HIGH', -10, 4],
        ['Modelagem de agenda por profissional', 'DONE', 'HIGH', -6, 6],
        ['Tela de escolha de horário', 'DOING', 'HIGH', 3, 8],
        ['Lembrete por e-mail 24h antes', 'TODO', 'MEDIUM', 10, 5],
        ['Confirmação e cancelamento pelo paciente', 'TODO', 'MEDIUM', 12, 6],
        ['Relatório de faltas', 'TODO', 'LOW', 25, 4],
      ],
    },
    {
      name: 'Site institucional Studio Forma',
      description: 'Portfólio de obras com galeria, filtros por tipo de projeto e formulário de orçamento.',
      clientId: studio.id,
      color: 'sky',
      dueDate: at(-3),
      hourlyRate: 110,
      status: 'DONE',
      tasks: [
        ['Direção de arte', 'DONE', 'MEDIUM', -30, 6],
        ['Galeria de obras com filtros', 'DONE', 'HIGH', -22, 10],
        ['Formulário de orçamento', 'DONE', 'MEDIUM', -12, 4],
        ['SEO e publicação', 'DONE', 'HIGH', -4, 3],
      ],
    },
    {
      name: 'Marketing pessoal',
      description: 'Projeto interno: portfólio, conteúdo e prospecção.',
      clientId: null,
      color: 'violet',
      dueDate: null,
      hourlyRate: null,
      tasks: [
        ['Atualizar cases no portfólio', 'DOING', 'MEDIUM', 4, 3],
        ['Escrever artigo sobre Pix no checkout', 'TODO', 'LOW', 12, 3],
        ['Revisar proposta comercial padrão', 'REVIEW', 'MEDIUM', 0, 2],
      ],
    },
  ]

  for (const [projectIndex, project] of projects.entries()) {
    const { tasks, ...data } = project
    const created = await prisma.project.create({ data: { ...data, ownerId: user.id } })
    const positions = {}

    for (const [taskIndex, [title, status, priority, due, estimate, clientVisible = true]] of tasks.entries()) {
      positions[status] = (positions[status] ?? 0) + 1
      const done = status === 'DONE'
      const task = await prisma.task.create({
        data: {
          projectId: created.id,
          title,
          status,
          priority,
          position: positions[status],
          dueDate: at(due),
          estimateHours: estimate,
          clientVisible,
          completedAt: done ? at(due > -10 ? -1 - (taskIndex % 3) : due + 1, 17) : null,
        },
      })

      // Time entries spread over the last two weeks for tasks that have started.
      if (status === 'TODO') continue
      const sessions = done ? 3 : 2
      for (let s = 0; s < sessions; s++) {
        const offset = -((taskIndex * 3 + s * 2 + projectIndex) % 13)
        const startedAt = at(offset, 9 + ((s * 3 + taskIndex) % 8))
        const minutes = 35 + ((taskIndex * 37 + s * 53 + projectIndex * 11) % 150)
        await prisma.timeEntry.create({
          data: {
            taskId: task.id,
            userId: user.id,
            startedAt,
            endedAt: new Date(startedAt.getTime() + minutes * 60000),
            minutes,
          },
        })
      }
    }
  }

  console.log(`Demo account ready: ${DEMO.email} / ${DEMO.password}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
