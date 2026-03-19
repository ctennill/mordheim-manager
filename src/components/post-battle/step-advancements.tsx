'use client'

import { usePostBattle } from '@/store/post-battle'
import { getAdvancementEntry, HERO_ADVANCEMENT_TABLE } from '@/lib/game-rules/advancement-table'

const STAT_LABELS: Record<string, string> = {
  move: 'Movement', weapon_skill: 'WS', ballistic_skill: 'BS',
  strength: 'Strength', toughness: 'Toughness', wounds: 'Wounds',
  initiative: 'Initiative', attacks: 'Attacks', leadership: 'Leadership',
}

export function StepAdvancements() {
  const { advancementQueue, setAdvancementRoll, setAdvancementChoice, markAdvancementApplied } = usePostBattle()

  if (advancementQueue.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No advancements available this battle.</p>
      </div>
    )
  }

  const allApplied = advancementQueue.every((a) => a.applied)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Roll 2D6 for each advancement. Apply the result to the warrior.
      </p>

      {advancementQueue.map((adv) => {
        const entry = adv.roll2d6 !== null ? getAdvancementEntry(adv.roll2d6) : null

        return (
          <div
            key={`${adv.warriorId}-${adv.advanceIndex}`}
            className={`rounded-md border bg-card p-4 space-y-4 ${adv.applied ? 'border-emerald-500/30 opacity-70' : 'border-gold/30'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-foreground">{adv.warriorName}</span>
                <span className="text-xs text-gold ml-2 border border-gold/30 rounded px-1.5 py-0.5">
                  Advance #{adv.advanceIndex}
                </span>
              </div>
              {adv.applied && (
                <span className="text-xs text-emerald-400 border border-emerald-500/30 rounded px-2 py-0.5">Applied</span>
              )}
            </div>

            {adv.roll2d6 === null ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const d1 = Math.ceil(Math.random() * 6)
                    const d2 = Math.ceil(Math.random() * 6)
                    setAdvancementRoll(adv.warriorId, adv.advanceIndex, d1 + d2)
                  }}
                  className="px-4 py-1.5 text-sm rounded border border-border text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors"
                >
                  Roll 2D6 for me
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={2} max={12} placeholder="2–12"
                    className="w-16 text-center rounded border border-border bg-muted/30 px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-gold/50 text-sm"
                    onBlur={(e) => {
                      const val = parseInt(e.target.value)
                      if (val >= 2 && val <= 12) setAdvancementRoll(adv.warriorId, adv.advanceIndex, val)
                    }}
                  />
                  <span className="text-xs text-muted-foreground">enter roll</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded border border-border px-3 py-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">2D6: {adv.roll2d6}</span>
                    <span className="text-sm font-semibold text-gold">{entry?.description}</span>
                  </div>
                </div>

                {/* Choice for stat options */}
                {entry?.statOptions && !adv.chosenStat && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Choose one stat to increase:</p>
                    <div className="flex gap-2">
                      {entry.statOptions.map((stat) => (
                        <button
                          key={stat}
                          type="button"
                          onClick={() => setAdvancementChoice(adv.warriorId, adv.advanceIndex, stat)}
                          className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors"
                        >
                          +1 {STAT_LABELS[stat] ?? stat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Choice for new skill */}
                {entry?.type === 'new_skill' && !adv.chosenSkill && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Enter the skill name chosen from this hero&apos;s skill lists:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Skill name…"
                        className="flex-1 field-input"
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            setAdvancementChoice(adv.warriorId, adv.advanceIndex, undefined, e.target.value.trim())
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {!adv.applied && (
                  (entry?.type === 'stat_increase' && !entry.statOptions && entry.stat) ||
                  adv.chosenStat ||
                  adv.chosenSkill ||
                  entry?.type === 'lads_got_talent' ||
                  entry?.type === 'double_roll'
                ) && (
                  <button
                    type="button"
                    onClick={() => markAdvancementApplied(adv.warriorId, adv.advanceIndex)}
                    className="px-4 py-1.5 text-sm rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                  >
                    Confirm Advancement
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}

      {allApplied && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          All advancements resolved.
        </div>
      )}
    </div>
  )
}
