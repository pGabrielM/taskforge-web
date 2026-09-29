import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'
import { siteConfig } from '@/config/site'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="w-fit">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <div className="forge-card p-7">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{title}</h1>
            <p className="mt-1 mb-7 text-sm text-zinc-600">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l-2 border-zinc-900 bg-brand-500 lg:block">
        <div
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, #211a11 0 2px, transparent 2px 18px)' }}
        />
        <div className="relative flex h-full flex-col justify-end p-12 text-zinc-950">
          <p className="max-w-md font-serif text-5xl leading-[1.05] font-semibold tracking-tight">{siteConfig.tagline}</p>
          <ul className="mt-8 space-y-3 text-sm font-medium">
            {siteConfig.highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rotate-45 bg-zinc-900" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
