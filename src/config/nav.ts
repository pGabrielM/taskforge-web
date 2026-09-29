import { Clock, FolderKanban, LayoutDashboard, Users } from 'lucide-react'

export const appNav = [
  { href: '/app', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/app/projects', label: 'Projetos', icon: FolderKanban },
  { href: '/app/clients', label: 'Clientes', icon: Users },
  { href: '/app/time', label: 'Horas', icon: Clock },
]
