'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { appNav } from '@/config/nav'
import { cn } from '@/lib/utils'

/** Trilho de ícones (desktop) ou lista com rótulos (menu mobile). */
export function SidebarNav({ onNavigate, rail = false }: { onNavigate?: () => void; rail?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex flex-col', rail ? 'items-center gap-3' : 'gap-2')}>
      {appNav.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={item.label}
            aria-label={item.label}
            className={cn(
              'group relative flex items-center gap-3 rounded-md border-2 text-sm font-bold transition-all',
              rail ? 'size-11 justify-center' : 'px-3 py-2.5',
              active
                ? 'border-zinc-900 bg-brand-500 text-zinc-950 shadow-forge'
                : 'border-transparent text-zinc-600 hover:border-zinc-900 hover:bg-white hover:text-zinc-900',
            )}
          >
            <Icon className="size-5" />
            {rail ? (
              <span className="pointer-events-none absolute left-full z-50 ml-3 hidden rounded-sm border-2 border-zinc-900 bg-zinc-900 px-2 py-1 text-xs whitespace-nowrap text-brand-100 group-hover:block">
                {item.label}
              </span>
            ) : (
              item.label
            )}
          </Link>
        )
      })}
    </nav>
  )
}
