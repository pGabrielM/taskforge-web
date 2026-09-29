import { Clock, Download } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ConfirmButton } from '@/components/confirm-button'
import { PageHeader } from '@/components/shell/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { deleteTimeEntry } from '@/lib/actions'
import { projectColor } from '@/lib/constants'
import { currency, formatDate, formatMinutes } from '@/lib/format'
import { PERIODS, resolvePeriod } from '@/lib/periods'
import { getTimeReport } from '@/lib/queries'
import { requireUser } from '@/lib/session'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Horas' }

export default async function TimePage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const user = await requireUser()
  const { period, from, to } = resolvePeriod((await searchParams).period)
  const report = await getTimeReport(user.id, from, to)
  const billable = report.byProject.reduce((sum, project) => sum + (project.amount ?? 0), 0)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Horas"
        description={`${formatDate(from, "d 'de' MMM")} a ${formatDate(to, "d 'de' MMM")}`}
        actions={
          <Button asChild variant="secondary">
            <a href={`/app/time/export?period=${period}`}>
              <Download /> Exportar CSV
            </a>
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm sm:w-fit">
        {Object.entries(PERIODS).map(([key, label]) => (
          <Link
            key={key}
            href={`/app/time?period=${key}`}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              key === period ? 'bg-brand-600 text-white' : 'text-zinc-600 hover:bg-zinc-100',
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {report.entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Nenhuma hora registrada neste período"
          description="Abra uma tarefa no quadro e use o timer ou lance horas manualmente."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Por projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-6 rounded-lg bg-zinc-50 p-4">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{formatMinutes(report.totalMinutes)}</p>
                  <p className="text-xs text-zinc-500">Total</p>
                </div>
                {billable > 0 && (
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{currency.format(billable)}</p>
                    <p className="text-xs text-zinc-500">A faturar</p>
                  </div>
                )}
              </div>
              {report.byProject.map((project) => (
                <div key={project.id}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={`size-2 shrink-0 rounded-full ${projectColor(project.color).dot}`} />
                      <span className="truncate">{project.name}</span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">{formatMinutes(project.minutes)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-full rounded-full ${projectColor(project.color).bar}`}
                      style={{ width: `${(project.minutes / report.totalMinutes) * 100}%` }}
                    />
                  </div>
                  {project.amount !== null && (
                    <p className="mt-1 text-right text-xs text-zinc-500">{currency.format(project.amount)}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lançamentos</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-y border-zinc-100 bg-zinc-50 text-left text-xs text-zinc-500">
                  <tr>
                    <th className="px-5 py-2 font-medium">Data</th>
                    <th className="px-3 py-2 font-medium">Tarefa</th>
                    <th className="px-3 py-2 text-right font-medium">Tempo</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {report.entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-50">
                      <td className="px-5 py-2.5 whitespace-nowrap text-zinc-500">{formatDate(entry.startedAt, 'dd/MM')}</td>
                      <td className="px-3 py-2.5">
                        <Link href={`/app/projects/${entry.task.project.id}`} className="block max-w-xs truncate text-zinc-900 hover:underline">
                          {entry.task.title}
                        </Link>
                        <span className="text-xs text-zinc-500">{entry.task.project.name}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap tabular-nums">{formatMinutes(entry.minutes)}</td>
                      <td className="pr-3">
                        <ConfirmButton
                          compact
                          title="Excluir lançamento?"
                          description="O tempo será removido dos relatórios."
                          action={deleteTimeEntry.bind(null, entry.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
