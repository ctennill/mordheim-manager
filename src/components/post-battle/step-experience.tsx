'use client'

import { usePostBattle } from '@/store/post-battle'
import { getNextHeroThreshold } from '@/lib/game-rules/xp-thresholds'

export function StepExperience() {
  const { xpEntries, setXpGain, buildAdvancementQueue } = usePostBattle()

  if (xpEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No warriors to update.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review and confirm XP gained this battle. Adjust if any warrior earned bonus XP.
      </p>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium">Warrior</th>
              <th className="text-center px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium">Current</th>
              <th className="text-center px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium">Gained</th>
              <th className="text-center px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium">New Total</th>
              <th className="text-center px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium">Next</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {xpEntries.map((entry) => {
              const newXp = entry.currentXp + entry.xpGained
              const nextThreshold = entry.isHero ? getNextHeroThreshold(newXp) : null
              const willAdvance = entry.isHero && (() => {
                const { getHeroAdvancementCount } = require('@/lib/game-rules/xp-thresholds')
                return getHeroAdvancementCount(newXp) > entry.advancementsTaken
              })()

              return (
                <tr key={entry.warriorId} className={willAdvance ? 'bg-gold/5' : ''}>
                  <td className="px-4 py-3">
                    <div className="text-foreground font-medium">{entry.warriorName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{entry.isHero ? 'Hero' : 'Henchman'}</div>
                  </td>
                  <td className="px-3 py-3 text-center font-mono text-muted-foreground">{entry.currentXp}</td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setXpGain(entry.warriorId, Math.max(0, entry.xpGained - 1))}
                        className="w-5 h-5 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-gold/40 text-xs transition-colors"
                      >−</button>
                      <span className="w-6 text-center font-mono text-emerald-400 font-medium">+{entry.xpGained}</span>
                      <button
                        type="button"
                        onClick={() => setXpGain(entry.warriorId, entry.xpGained + 1)}
                        className="w-5 h-5 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-gold/40 text-xs transition-colors"
                      >+</button>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center font-mono font-bold text-foreground">{newXp}</td>
                  <td className="px-3 py-3 text-center">
                    {willAdvance ? (
                      <span className="text-xs text-gold border border-gold/40 rounded px-1.5 py-0.5">Advance!</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">
                        {nextThreshold !== null ? nextThreshold : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={buildAdvancementQueue}
        className="w-full py-2.5 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
      >
        Confirm XP &amp; Check Advancements →
      </button>
    </div>
  )
}
