export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect x="2" y="2" width="28" height="28" rx="6" fill="#f47106" stroke="#211a11" strokeWidth="2.5" />
        <path d="M9 22h14l-2-5h-3.5V12l-3-3-3 3v5H11z" fill="#211a11" />
        <path d="M11 24.5h10" stroke="#211a11" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {!compact && (
        <span className="font-serif text-xl leading-none font-semibold tracking-tight">
          task<span className="text-brand-600">forge</span>
        </span>
      )}
    </span>
  )
}
