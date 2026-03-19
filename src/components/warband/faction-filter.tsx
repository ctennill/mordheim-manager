'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { type FactionType } from '@/types/database'

const FILTERS: { label: string; value: FactionType | 'all' }[] = [
  { label: 'All',        value: 'all' },
  { label: 'Official',   value: 'official' },
  { label: 'Supplement', value: 'supplement' },
  { label: 'Custom',     value: 'custom' },
]

export function FactionFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = (searchParams.get('type') ?? 'all') as FactionType | 'all'

  function setFilter(value: FactionType | 'all') {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('type')
    } else {
      params.set('type', value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
            current === f.value
              ? 'border-gold/60 bg-gold/10 text-gold'
              : 'border-border text-muted-foreground hover:border-gold/30 hover:text-foreground'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
