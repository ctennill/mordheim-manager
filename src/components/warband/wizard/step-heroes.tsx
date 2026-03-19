'use client'

import { useWarbandBuilder } from '@/store/warband-builder'
import { useFactionPositions } from '@/hooks/use-faction-data'
import { type FactionPosition } from '@/types/database'

const STAT_LABELS = ['M', 'WS', 'BS', 'S', 'T', 'W', 'I', 'A', 'Ld']

function getStats(p: FactionPosition) {
  return [p.move, p.weapon_skill, p.ballistic_skill, p.strength, p.toughness, p.wounds, p.initiative, p.attacks, p.leadership]
}

export function StepHeroes() {
  const { factionId, heroes, addHero, removeHero, updateHeroName } = useWarbandBuilder()
  const { data: positions, isLoading } = useFactionPositions(factionId)

  const heroPositions = (positions ?? []).filter((p) => p.warrior_type === 'hero')

  // Count how many of each position are hired
  const hiredCount = (positionId: string) =>
    heroes.filter((h) => h.positionId === positionId).length

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-md bg-muted/30 animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Hire your heroes. You <strong className="text-foreground">must</strong> hire the Leader.
        Other heroes are optional within their allowed limits.
      </p>

      {/* Position availability cards */}
      <div className="space-y-3">
        {heroPositions.map((pos) => {
          const count = hiredCount(pos.id)
          const atMax = count >= pos.max_count
          const stats = getStats(pos)

          return (
            <div key={pos.id} className="rounded-md border border-border bg-card p-4 space-y-3">
              {/* Position header */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{pos.name}</h3>
                    {pos.is_leader && (
                      <span className="text-[10px] border border-gold/30 text-gold rounded px-1.5 py-0.5">
                        Leader
                      </span>
                    )}
                    <span className="text-[10px] border border-border text-muted-foreground rounded px-1.5 py-0.5">
                      {pos.is_leader ? '1 only' : `0–${pos.max_count}`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pos.cost} gc each
                    {pos.primary_skills.length > 0 && ` · ${pos.primary_skills.join(', ')}`}
                  </p>
                </div>

                <button
                  onClick={() => addHero(pos)}
                  disabled={atMax}
                  className="shrink-0 px-3 py-1.5 rounded text-sm font-medium border border-gold/40 text-gold hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  + Hire ({count}/{pos.max_count})
                </button>
              </div>

              {/* Stat block */}
              <div className="flex gap-0 border border-border rounded overflow-hidden text-xs font-mono">
                {STAT_LABELS.map((label, i) => (
                  <div key={label} className="flex-1 flex flex-col items-center py-1 border-r border-border last:border-r-0">
                    <span className="text-[9px] text-muted-foreground uppercase">{label}</span>
                    <span className="font-bold text-foreground">{stats[i]}</span>
                  </div>
                ))}
              </div>

              {/* Hired instances */}
              {heroes
                .filter((h) => h.positionId === pos.id)
                .map((hero) => (
                  <div key={hero.tempId} className="flex items-center gap-2 pl-2 border-l-2 border-gold/30">
                    <input
                      type="text"
                      value={hero.name}
                      onChange={(e) => updateHeroName(hero.tempId, e.target.value)}
                      placeholder={`${pos.name} name (optional)`}
                      maxLength={40}
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={() => removeHero(hero.tempId)}
                      className="shrink-0 px-2 py-1 text-xs text-muted-foreground hover:text-red-400 border border-border hover:border-red-400/40 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
