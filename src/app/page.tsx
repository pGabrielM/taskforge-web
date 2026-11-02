import { Clock, FileSpreadsheet, FolderKanban, Globe, LayoutDashboard, Users } from 'lucide-react'
import { Landing, type LandingContent } from '@/components/marketing/landing'

const content: LandingContent = {
  eyebrow: 'Para freelancers e pequenas equipes',
  title: 'Seus projetos, horas e clientes no mesmo lugar',
  subtitle:
    'Organize entregas em um quadro kanban, registre o tempo de cada tarefa e envie ao cliente um link para ele acompanhar o andamento — sem planilhas nem mensagens de status.',
  screenshot: { src: '/screenshots/board.png', alt: 'Quadro kanban do TaskForge' },
  proof: ['Grátis e open source', 'Portal do cliente sem login', 'Exporta horas em CSV'],
  features: [
    { icon: FolderKanban, title: 'Kanban por projeto', description: 'Arraste tarefas entre A fazer, Em andamento, Revisão e Concluído. Prioridade, prazo e estimativa em cada card.' },
    { icon: Clock, title: 'Timer de horas', description: 'Inicie o timer em uma tarefa com um clique ou lance horas manualmente. Só um timer roda por vez.' },
    { icon: Globe, title: 'Portal do cliente', description: 'Gere um link somente leitura com o progresso do projeto. Tarefas internas podem ficar ocultas.' },
    { icon: LayoutDashboard, title: 'Visão geral', description: 'Prazos da semana, tarefas atrasadas, entregas recentes e horas dos últimos 14 dias.' },
    { icon: Users, title: 'Clientes', description: 'Contatos e projetos de cada cliente, com valor/hora para calcular o que faturar.' },
    { icon: FileSpreadsheet, title: 'Relatório de horas', description: 'Totais por projeto e por período, com exportação em CSV pronta para o Excel.' },
  ],
  steps: [
    { title: 'Crie o projeto', description: 'Vincule a um cliente, defina prazo e valor/hora se quiser calcular faturamento.' },
    { title: 'Trabalhe no quadro', description: 'Quebre o escopo em tarefas, mova os cards e ligue o timer enquanto trabalha.' },
    { title: 'Compartilhe o progresso', description: 'Envie o link do portal ao cliente e exporte as horas no fechamento do mês.' },
  ],
  stack: [
    { name: 'Next.js 16 + React 19', detail: 'App Router, Server Components e Server Actions — sem API REST intermediária.' },
    { name: 'Prisma 7 + PostgreSQL', detail: 'Modelo relacional com índices por dono, status e posição no quadro.' },
    { name: 'Auth.js v5', detail: 'Sessão JWT, senhas com bcrypt e proxy protegendo toda a área /app.' },
    { name: 'dnd-kit', detail: 'Arrastar e soltar acessível (mouse e teclado) com atualização otimista.' },
    { name: 'Zod', detail: 'Toda entrada validada no servidor; toda query filtrada pelo dono dos dados.' },
    { name: 'Tailwind CSS 4', detail: 'Interface responsiva, do celular ao monitor ultrawide.' },
  ],
}

export default function HomePage() {
  return <Landing content={content} />
}
