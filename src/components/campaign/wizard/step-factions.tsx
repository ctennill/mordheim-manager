'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCampaignCreation } from '@/store/campaign-creation'
import { type Faction } from '@/types/database'
import { getFactionTheme } from '@/lib/faction-theme'

function useFactions() {
  return useQuery({
    queryKey: ['factions', 'all'],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('factions')
        .select('id, name, type, is_enabled')
        .order('name')
      return (data ?? []) as Pick<Faction, 'id' | 'name' | 'type' | 'is_enabled'>[]
    },
  })
}

export function StepFactions() {
  const state = useCampaignCreation()
  const { data: factions = [], isLoading } = useFactions()

  const official = factions.filter((f) => f.type === 'official' && f.is_enabled)
  const supplements = factions.filter((f) => f.type === 'supplement' && f.is_enabled)

  const isRestricted = state.allowedFactionIds !== null

  function toggleRestricted() {
    if (isRestricted) {
      // Switch back to "all allowed"
      state.set({ allowedFactionIds: null })
    } else {
      // Switch to explicit list — start with all currently-enabled factions
      const ids = factions
        .filter((f) => {
          if (f.type === 'official') return state.allowAllOfficial
          if (f.type === 'supplement') return state.allowSupplements
          return false
        })
        .map((f) => f.id)
      state.set({ allowedFactionIds: ids })
    }
  }

  function isFactionAllowed(id: string) {
    if (state.allowedFactionIds === null) return true
    return state.allowedFactionIds.includes(id)
  }

  function toggleFactionAllowed(id: string) {
    if (state.allowedFactionIds === null) return
    const allowed = state.allowedFactionIds
    state.set({
      allowedFactionIds: allowed.includes(id)
        ? allowed.filter((x) => x !== id)
        : [...allowed, id],
    })
  }

  function getSlot(id: string): number {
    return state.factionSlots[id] ?? 0
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 rounded-md bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Allow toggles */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Faction Sources</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.allowAllOfficial}
            onChange={(e) => state.set({ allowAllOfficial: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-sm text-foreground">Allow all official factions</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.allowSupplements}
            onChange={(e) => state.set({ allowSupplements: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-sm text-foreground">Allow supplement factions</span>
        </label>
      </div>

      {/* Fine-grained control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Fine-grained Control</p>
          <button
            type="button"
            onClick={toggleRestricted}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              isRestricted
                ? 'border-gold/60 text-gold bg-gold/10'
                : 'border-border text-muted-foreground hover:border-gold/20'
            }`}
          >
            {isRestricted ? 'Restricted list active' : 'Enable per-faction control'}
          </button>
        </div>

        {isRestricted && (
          <div className="space-y-4">
            {/* Official factions */}
            {official.length > 0 && (
              <FactionGroup
                title="Official"
                factions={official}
                isFactionAllowed={isFactionAllowed}
                toggleFactionAllowed={toggleFactionAllowed}
                getSlot={getSlot}
                setSlot={(id, n) => state.setFactionSlot(id, n)}
              />
            )}
            {/* Supplement factions */}
            {supplements.length > 0 && (
              <FactionGroup
                title="Supplements"
                factions={supplements}
                isFactionAllowed={isFactionAllowed}
                toggleFactionAllowed={toggleFactionAllowed}
                getSlot={getSlot}
                setSlot={(id, n) => state.setFactionSlot(id, n)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FactionGroup({
  title, factions, isFactionAllowed, toggleFactionAllowed, getSlot, setSlot,
}: {
  title: string
  factions: Pick<Faction, 'id' | 'name' | 'type'>[]
  isFactionAllowed: (id: string) => boolean
  toggleFactionAllowed: (id: string) => void
  getSlot: (id: string) => number
  setSlot: (id: string, n: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/60">{title}</p>
      <div className="space-y-1">
        {factions.map((f) => {
          const theme = getFactionTheme(f.name)
          const allowed = isFactionAllowed(f.id)
          const slot = getSlot(f.id)
          return (
            <div
              key={f.id}
              className={`flex items-center gap-3 rounded px-3 py-2 border transition-colors ${
                allowed ? 'border-border bg-card' : 'border-border/30 bg-card/30 opacity-50'
              }`}
            >
              <input
                type="checkbox"
                checked={allowed}
                onChange={() => toggleFactionAllowed(f.id)}
                className="accent-gold shrink-0"
              />
              <span className="text-lg leading-none">{theme.icon}</span>
              <span className="flex-1 text-sm text-foreground">{f.name}</span>
              {allowed && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground">Max slots:</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={slot === 0 ? '' : slot}
                    placeholder="∞"
                    onChange={(e) => setSlot(f.id, Number(e.target.value))}
                    className="w-12 text-center text-sm rounded border border-border bg-muted/30 px-1 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-gold/50"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
