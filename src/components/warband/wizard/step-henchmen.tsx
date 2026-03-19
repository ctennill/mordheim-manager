'use client'

import { useWarbandBuilder } from '@/store/warband-builder'
import { useFactionPositions } from '@/hooks/use-faction-data'
import { type FactionPosition } from '@/types/database'

const STAT_LABELS = ['M', 'WS', 'BS', 'S', 'T', 'W', 'I', 'A', 'Ld']

function getStats(p: FactionPosition) {
  return [p.move, p.weapon_skill, p.ballistic_skill, p.strength, p.toughness, p.wounds, p.initiative, p.attacks, p.leadership]
}

export function StepHenchmen() {
  const { factionId, henchmen, addHenchmanGroup, removeHenchmanGroup, updateHenchmanCount, totalModels } =
    useWarbandBuilder()
  const { data: positions, isLoading } = useFactionPositions(factionId)

  const henchmanPositions = (positions ?? []).filter((p) => p.warrior_type === 'henchman')

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 rounded-md bg-muted/30 animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add henchman groups. All models in a group share the same stats and equipment.
        </p>
        <span className="text-sm text-muted-foreground shrink-0">
          {totalModels()} model{totalModels() !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* Available henchman types */}
      <div className="space-y-3">
        {henchmanPositions.map((pos) => {
          const stats = getStats(pos)

          return (
            <div key={pos.id} className="rounded-md border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{pos.name}</h3>
                    <span className="text-[10px] border border-border text-muted-foreground rounded px-1.5 py-0.5">
                      0–{pos.max_count} per group
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{pos.cost} gc each</p>
                </div>

                <button
                  onClick={() => addHenchmanGroup(pos)}
                  className="shrink-0 px-3 py-1.5 rounded text-sm font-medium border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
                >
                  + Add Group
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

              {/* Active groups of this type */}
              {henchmen
                .filter((h) => h.positionId === pos.id)
                .map((group) => (
                  <div key={group.tempId} className="flex items-center gap-3 pl-2 border-l-2 border-gold/30">
                    <span className="text-sm text-muted-foreground shrink-0">Count:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateHenchmanCount(group.tempId, Math.max(1, group.count - 1))}
                        className="w-7 h-7 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-foreground">
                        {group.count}
                      </span>
                      <button
                        onClick={() => updateHenchmanCount(group.tempId, Math.min(pos.max_count, group.count + 1))}
                        disabled={group.count >= pos.max_count}
                        className="w-7 h-7 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({group.count * pos.cost} gc)
                    </span>
                    <button
                      onClick={() => removeHenchmanGroup(group.tempId)}
                      className="ml-auto text-xs text-muted-foreground hover:text-red-400 border border-border hover:border-red-400/40 rounded px-2 py-1 transition-colors"
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
