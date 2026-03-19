'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useWarbandBuilder } from '@/store/warband-builder'
import { getFactionTheme, ALIGNMENT_LABELS } from '@/lib/faction-theme'
import { type Faction } from '@/types/database'

export function StepFaction() {
  const { factionId, setFaction, setStep } = useWarbandBuilder()

  const { data: factions, isLoading } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('factions')
        .select('*')
        .eq('is_enabled', true)
        .order('name')
      if (error) throw error
      return (data ?? []) as Faction[]
    },
    staleTime: 5 * 60 * 1000,
  })

  function handleSelect(faction: Faction) {
    setFaction(faction.id, faction.name, faction.starting_gold)
    setStep('name')
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 rounded-md bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose your warband faction. This cannot be changed after this step.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(factions ?? []).map((faction) => {
          const theme = getFactionTheme(faction.name)
          const alignStyle = faction.alignment ? ALIGNMENT_LABELS[faction.alignment] : null
          const selected = factionId === faction.id

          return (
            <button
              key={faction.id}
              onClick={() => handleSelect(faction)}
              className={`text-left rounded-md border p-4 space-y-3 transition-all ${
                selected
                  ? `${theme.borderClass} bg-card ring-2 ring-gold/40`
                  : `border-border bg-card ${theme.bgClass} hover:border-gold/20`
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{theme.icon}</span>
                <span
                  className={`font-bold text-sm ${theme.accentClass}`}
                  style={{ fontFamily: 'var(--font-cinzel), serif' }}
                >
                  {faction.name}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {alignStyle && (
                  <span className={`text-[10px] border rounded px-1.5 py-0.5 ${alignStyle.className}`}>
                    {alignStyle.label}
                  </span>
                )}
                <span className="text-[10px] border border-border rounded px-1.5 py-0.5 text-muted-foreground">
                  {faction.starting_gold} gc
                </span>
                <span className="text-[10px] border border-border rounded px-1.5 py-0.5 text-muted-foreground">
                  Up to {faction.max_warband_size}
                </span>
              </div>

              {faction.special_rules.length > 0 && (
                <p className={`text-[11px] ${theme.accentClass} opacity-80 line-clamp-2`}>
                  {faction.special_rules[0].split(':')[0]}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
