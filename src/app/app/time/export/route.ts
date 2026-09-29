import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/auth'
import { formatDate } from '@/lib/format'
import { resolvePeriod } from '@/lib/periods'
import { getTimeReport } from '@/lib/queries'

function csvCell(value: string | number | null | undefined): string {
  const text = String(value ?? '')
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { period, from, to } = resolvePeriod(request.nextUrl.searchParams.get('period') ?? undefined)
  const report = await getTimeReport(session.user.id, from, to)

  const header = ['Data', 'Cliente', 'Projeto', 'Tarefa', 'Minutos', 'Horas', 'Observação']
  const rows = report.entries.map((entry) => [
    formatDate(entry.startedAt, 'dd/MM/yyyy'),
    entry.task.project.client?.name ?? '',
    entry.task.project.name,
    entry.task.title,
    entry.minutes,
    (entry.minutes / 60).toFixed(2).replace('.', ','),
    entry.note ?? '',
  ])
  // Semicolon + BOM so the file opens correctly in Excel pt-BR.
  const csv = '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="horas-${period}.csv"`,
    },
  })
}
