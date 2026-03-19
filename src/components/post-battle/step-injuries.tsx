'use client'

import { useState } from 'react'
import { usePostBattle } from '@/store/post-battle'
import { getInjuryResult, rollD66, type InjuryResult } from '@/lib/game-rules/injury-table'

const EFFECT_COLORS: Record<string, string> = {
  none: 'text-muted-foreground',
  miss_next_battle: 'text-amber-400',
  stat_modifier: 'text-orange-400',
  captured: 'text-purple-400',
  dead: 'text-red-500',
  gold_loss: 'text-amber-400',
  skill_loss: 'text-orange-400',
  equipment_loss: 'text-orange-400',
  special: 'text-blue-400',
}

export function StepInjuries() {
  const { oaaWarriors, setInjuryRoll, setGoldLoss, markInjuryApplied } = usePostBattle()

  if (oaaWarriors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No warriors went Out of Action — skip to the next step.</p>
      </div>
    )
  }

  const allApplied = oaaWarriors.every((w) => w.applied)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Roll D66 for each warrior that went Out of Action. First die = tens, second die = units.
      </p>
      {oaaWarriors.map((warrior) => (
        <InjuryCard
          key={warrior.warriorId}
          warrior={warrior}
          onRoll={(d66, result, subRolls) => setInjuryRoll(warrior.warriorId, d66, result, subRolls)}
          onGoldLoss={(amount) => setGoldLoss(warrior.warriorId, amount)}
          onApply={() => markInjuryApplied(warrior.warriorId)}
        />
      ))}
      {allApplied && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          All injuries resolved.
        </div>
      )}
    </div>
  )
}

function InjuryCard({
  warrior, onRoll, onGoldLoss, onApply,
}: {
  warrior: ReturnType<typeof usePostBattle.getState>['oaaWarriors'][0]
  onRoll: (d66: string, result: InjuryResult, subRolls?: { d66: string; result: InjuryResult }[]) => void
  onGoldLoss: (amount: number) => void
  onApply: () => void
}) {
  const [tens, setTens] = useState('')
  const [units, setUnits] = useState('')
  const [goldRoll, setGoldRoll] = useState<number | null>(null)

  function handleRoll() {
    const d66 = `${tens}${units}`
    const result = getInjuryResult(d66)
    if (!result) return

    if (result.effect === 'special' && result.name === 'Multiple Injuries') {
      // Roll D6 sub-rolls
      const subRolls: { d66: string; result: InjuryResult }[] = []
      const count = Math.ceil(Math.random() * 6)
      for (let i = 0; i < count; i++) {
        let sub = rollD66()
        // Re-roll further multiple injuries results
        while (sub === '46') sub = rollD66()
        const subResult = getInjuryResult(sub)
        if (subResult) subRolls.push({ d66: sub, result: subResult })
      }
      onRoll(d66, result, subRolls)
    } else {
      onRoll(d66, result)
    }
  }

  function handleSimRoll() {
    const d66 = rollD66()
    setTens(d66[0])
    setUnits(d66[1])
    const result = getInjuryResult(d66)
    if (!result) return
    if (result.effect === 'special' && result.name === 'Multiple Injuries') {
      const subRolls: { d66: string; result: InjuryResult }[] = []
      const count = Math.ceil(Math.random() * 6)
      for (let i = 0; i < count; i++) {
        let sub = rollD66()
        while (sub === '46') sub = rollD66()
        const subResult = getInjuryResult(sub)
        if (subResult) subRolls.push({ d66: sub, result: subResult })
      }
      onRoll(d66, result, subRolls)
    } else {
      onRoll(d66, result)
    }
  }

  const d66Valid = /^[1-6][1-6]$/.test(`${tens}${units}`)
  const effectColor = warrior.result ? EFFECT_COLORS[warrior.result.effect] ?? 'text-muted-foreground' : ''

  // Gold loss: result Robbed = D6×5
  const needsGoldRoll = warrior.result?.effect === 'gold_loss' && warrior.resolvedGoldLoss === 0

  return (
    <div className={`rounded-md border bg-card p-4 space-y-4 ${warrior.applied ? 'border-emerald-500/30 opacity-70' : 'border-border'}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-foreground">{warrior.warriorName}</span>
          <span className="text-xs text-muted-foreground ml-2">{warrior.isHero ? 'Hero' : 'Henchman'}</span>
        </div>
        {warrior.applied && <span className="text-xs text-emerald-400 border border-emerald-500/30 rounded px-2 py-0.5">Resolved</span>}
      </div>

      {!warrior.d66Roll ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Tens</label>
              <input
                type="number" min={1} max={6}
                value={tens}
                onChange={(e) => setTens(e.target.value)}
                className="w-12 text-center rounded border border-border bg-muted/30 px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-gold/50 text-lg font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Units</label>
              <input
                type="number" min={1} max={6}
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-12 text-center rounded border border-border bg-muted/30 px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-gold/50 text-lg font-mono"
              />
            </div>
            <span className="text-2xl font-mono text-gold font-bold ml-2">
              {d66Valid ? `${tens}${units}` : '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRoll}
              disabled={!d66Valid}
              className="px-4 py-1.5 text-sm rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors disabled:opacity-30"
            >
              Look Up Result
            </button>
            <button
              type="button"
              onClick={handleSimRoll}
              className="px-4 py-1.5 text-sm rounded border border-border text-muted-foreground hover:border-gold/20 hover:text-foreground transition-colors"
            >
              Roll for me
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Result display */}
          <div className={`rounded border border-border px-3 py-2 space-y-1 ${
            warrior.result?.effect === 'dead' ? 'border-red-500/40 bg-red-500/5' : ''
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">D66: {warrior.d66Roll}</span>
              <span className={`text-sm font-semibold ${effectColor}`}>{warrior.result?.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{warrior.result?.description}</p>
          </div>

          {/* Sub-rolls for Multiple Injuries */}
          {warrior.subRolls.length > 0 && (
            <div className="space-y-1 pl-4 border-l-2 border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Multiple Injuries — Sub-rolls</p>
              {warrior.subRolls.map((sr, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-muted-foreground">{sr.d66}</span>
                  <span className={`font-medium ${EFFECT_COLORS[sr.result.effect] ?? ''}`}>{sr.result.name}</span>
                  <span className="text-muted-foreground">{sr.result.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Gold loss resolution */}
          {needsGoldRoll && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Roll D6 to determine gold lost (×5 gc):</p>
              <div className="flex items-center gap-3">
                {goldRoll === null ? (
                  <button
                    type="button"
                    onClick={() => {
                      const roll = Math.ceil(Math.random() * 6)
                      setGoldRoll(roll)
                      onGoldLoss(roll * 5)
                    }}
                    className="px-3 py-1.5 text-sm rounded border border-border text-muted-foreground hover:border-gold/40 transition-colors"
                  >
                    Roll D6
                  </button>
                ) : (
                  <span className="text-sm text-amber-400 font-mono">D6({goldRoll}) × 5 = {goldRoll * 5} gc lost</span>
                )}
              </div>
            </div>
          )}

          {!warrior.applied && (warrior.result?.effect !== 'gold_loss' || warrior.resolvedGoldLoss > 0) && (
            <button
              type="button"
              onClick={onApply}
              className="px-4 py-1.5 text-sm rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
            >
              Apply Result
            </button>
          )}
        </div>
      )}
    </div>
  )
}
