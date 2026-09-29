import { Logo } from '@/components/logo'
import { siteConfig } from '@/config/site'

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-zinc-900 bg-zinc-900 text-zinc-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3 text-brand-100">
          <Logo />
          <span className="font-mono text-xs text-zinc-400">© {new Date().getFullYear()} · MIT</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer" className="hover:text-brand-300">
            Código-fonte
          </a>
          <span>
            Forjado por{' '}
            <a
              href={siteConfig.author.url}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-brand-300 hover:underline"
            >
              {siteConfig.author.name}
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
