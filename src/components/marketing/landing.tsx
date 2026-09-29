import { ArrowRight, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Github } from '@/components/marketing/github-icon'
import { SiteFooter } from '@/components/marketing/site-footer'
import { SiteHeader } from '@/components/marketing/site-header'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

export type LandingContent = {
  eyebrow: string
  title: string
  subtitle: string
  screenshot: { src: string; alt: string }
  proof: string[]
  features: { icon: LucideIcon; title: string; description: string }[]
  steps: { title: string; description: string }[]
  stack: { name: string; detail: string }[]
}

export function Landing({ content }: { content: LandingContent }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div>
            <span className="inline-block -rotate-2 border-2 border-zinc-900 bg-brand-300 px-3 py-1 font-mono text-xs font-bold tracking-wider text-zinc-950 uppercase shadow-forge">
              {content.eyebrow}
            </span>
            <h1 className="mt-7 text-5xl leading-[1.02] font-semibold tracking-tight text-balance text-zinc-900 sm:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-700">{content.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">
                  Testar com a conta demo <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
                  <Github className="size-4" /> Ver código-fonte
                </a>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-zinc-700">
              {content.proof.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-4 text-brand-700" strokeWidth={3} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 translate-x-4 translate-y-4 rounded-md bg-brand-500" aria-hidden />
            <div className="relative rotate-1 rounded-md border-2 border-zinc-900 bg-white p-1.5 shadow-forge-lg">
              <Image
                src={content.screenshot.src}
                alt={content.screenshot.alt}
                width={1600}
                height={1000}
                priority
                className="rounded-sm border border-zinc-900"
              />
            </div>
          </div>
        </section>

        <div className="overflow-hidden border-y-2 border-zinc-900 bg-brand-500 py-2.5 font-mono text-xs font-bold tracking-widest whitespace-nowrap text-zinc-950 uppercase">
          <div className="flex gap-10 px-6">
            {Array.from({ length: 4 }).flatMap((_, i) =>
              content.features.map((feature) => <span key={`${i}-${feature.title}`}>◆ {feature.title}</span>),
            )}
          </div>
        </div>

        <section id="recursos" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance">
              Tudo o que você precisa, nada que atrapalhe
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`forge-card p-6 transition-transform hover:-translate-y-1 ${index % 2 ? 'sm:translate-y-3' : ''}`}
                >
                  <div className="flex size-11 items-center justify-center rounded-sm border-2 border-zinc-900 bg-brand-200 text-zinc-950">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-y-2 border-zinc-900 bg-zinc-100 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-4xl font-semibold tracking-tight">Como funciona</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {content.steps.map((step, index) => (
                <li key={step.title} className="relative border-l-4 border-brand-500 pl-6">
                  <span className="font-serif text-6xl leading-none font-semibold text-brand-500">{index + 1}</span>
                  <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="stack" className="bg-zinc-900 py-20 text-zinc-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight text-brand-200">Por dentro</h2>
                <p className="mt-3 text-zinc-400">
                  Código aberto, tipado de ponta a ponta e pronto para rodar com um comando. Leia o README para a
                  arquitetura completa.
                </p>
                <Button asChild className="mt-6">
                  <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
                    <Github className="size-4" /> Abrir no GitHub
                  </a>
                </Button>
              </div>
              <dl className="grid gap-px overflow-hidden rounded-md border-2 border-brand-500 bg-brand-500 sm:grid-cols-2">
                {content.stack.map((item) => (
                  <div key={item.name} className="bg-zinc-900 p-5">
                    <dt className="font-mono text-sm font-bold text-brand-300">{item.name}</dt>
                    <dd className="mt-1 text-sm text-zinc-400">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-4xl font-semibold tracking-tight">Veja funcionando em 10 segundos</h2>
            <p className="mt-3 text-zinc-700">A conta demo já vem com dados de exemplo. Nenhum cadastro necessário.</p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/login">
                Abrir a demo <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
