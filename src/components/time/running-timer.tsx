'use client'

import { Pause } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { stopTimer } from '@/lib/actions'
import { useAction } from '@/lib/use-action'

function elapsed(since: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - since) / 1000))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((part) => part.toString().padStart(2, '0')).join(':')
}

export function RunningTimer({
  startedAt,
  taskTitle,
  projectId,
}: {
  startedAt: string
  taskTitle: string
  projectId: string
}) {
  const [now, setNow] = useState<number | null>(null)
  const { pending, run } = useAction()

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const interval = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-full border border-brand-200 bg-brand-50 py-1 pr-1 pl-3">
      <span className="size-2 shrink-0 animate-pulse rounded-full bg-brand-600" />
      <Link href={`/app/projects/${projectId}`} className="min-w-0 truncate text-sm text-brand-900 hover:underline">
        {taskTitle}
      </Link>
      <span className="font-mono text-sm font-semibold text-brand-700 tabular-nums">
        {now === null ? '--:--:--' : elapsed(new Date(startedAt).getTime(), now)}
      </span>
      <button
        onClick={() => run(() => stopTimer(), { success: 'Tempo registrado.' })}
        disabled={pending}
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700"
        aria-label="Parar timer"
      >
        <Pause className="size-3.5" />
      </button>
    </div>
  )
}
