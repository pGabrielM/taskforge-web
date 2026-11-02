import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'
import { MobileNav } from '@/components/shell/mobile-nav'
import { SidebarNav } from '@/components/shell/sidebar-nav'
import { UserMenu } from '@/components/shell/user-menu'
import { siteConfig } from '@/config/site'
import { RunningTimer } from '@/components/time/running-timer'
import { getRunningTimer } from '@/lib/queries'
import { requireUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser()
  const isDemo = user.email === siteConfig.demo.email
  const running = await getRunningTimer(user.id)

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[76px] shrink-0 flex-col items-center gap-8 border-r-2 border-zinc-900 bg-zinc-100 py-4 lg:flex">
        <Link href="/app" aria-label="TaskForge">
          <Logo compact />
        </Link>
        <SidebarNav rail />
        <a
          href={siteConfig.author.url}
          title={`Projeto open source por ${siteConfig.author.name}`}
          className="mt-auto font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase [writing-mode:vertical-rl] hover:text-zinc-900"
        >
          open source · {siteConfig.author.name}
        </a>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {isDemo && (
          <div className="border-b-2 border-zinc-900 bg-brand-300 px-4 py-1.5 text-center text-xs font-bold text-zinc-950">
            Você está na conta demo — fique à vontade para criar, editar e apagar dados.
          </div>
        )}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b-2 border-zinc-900 bg-zinc-50/90 px-4 backdrop-blur sm:px-6">
          <MobileNav />
          <div className="lg:hidden">
            <Logo compact />
          </div>
          {running && (
            <div className="ml-auto min-w-0 max-w-md">
              <RunningTimer
                startedAt={running.startedAt.toISOString()}
                taskTitle={running.task.title}
                projectId={running.task.project.id}
              />
            </div>
          )}
          <div className={running ? 'shrink-0' : 'ml-auto'}>
            <UserMenu name={user.name} email={user.email} />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
