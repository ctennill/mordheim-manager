'use client'

import Link from 'next/link'
import { usePostBattle } from '@/store/post-battle'

export function StepSpend() {
  const {
    treasuryBefore, totalIncome, explorationOutcomes,
    goldSpent, spendNotes,
    setGoldSpent, setSpendNotes,
    warbandId,
  } = usePostBattle()

  const explorationGold = explorationOutcomes.reduce((s, o) => s + o.goldResolved, 0)
  const totalAvailable = treasuryBefore + totalIncome + explorationGold
  const remaining = totalAvailable - goldSpent

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Spend your gold on new warriors, equipment, or services. Your warband roster can be
        edited from the warband page.
      </p>

      {/* Treasury */}
      <div className="rounded-md border border-gold/20 bg-gold/5 px-5 py-4 space-y-2 text-sm">
        <p className="text-xs uppercase tracking-widest text-gold/70">Available Gold</p>
        <div className="flex justify-between text-muted-foreground">
          <span>Treasury before</span>
          <span className="font-mono">{treasuryBefore} gc</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Battle income</span>
          <span className="font-mono text-emerald-400">+{totalIncome} gc</span>
        </div>
        {explorationGold > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Exploration gold</span>
            <span className="font-mono text-emerald-400">+{explorationGold} gc</span>
          </div>
        )}
        <div className="h-px bg-border" />
        <div className="flex justify-between font-bold">
          <span className="text-foreground">Available</span>
          <span className="font-mono text-gold text-lg">{totalAvailable} gc</span>
        </div>
      </div>

      {/* Gold spent input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Gold Spent This Post-Battle</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGoldSpent(Math.max(0, goldSpent - 5))}
            className="w-9 h-9 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-gold/40 transition-colors"
          >−</button>
          <input
            type="number"
            min={0}
            max={totalAvailable}
            value={goldSpent}
            onChange={(e) => setGoldSpent(Math.max(0, Math.min(totalAvailable, Number(e.target.value))))}
            className="w-28 text-center field-input font-mono text-lg"
          />
          <button
            type="button"
            onClick={() => setGoldSpent(Math.min(totalAvailable, goldSpent + 5))}
            className="w-9 h-9 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-gold/40 transition-colors"
          >+</button>
          <span className="text-sm text-muted-foreground">gc</span>
        </div>
        {remaining < 0 && (
          <p className="text-xs text-destructive">Overspent by {Math.abs(remaining)} gc</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Purchases Summary</label>
        <textarea
          value={spendNotes}
          onChange={(e) => setSpendNotes(e.target.value)}
          placeholder="e.g. Hired 1 Youngblood (25 gc), bought sword for Karl (10 gc)…"
          rows={3}
          className="field-input resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use your warband page to make actual roster changes. This notes field is for your record.
        </p>
      </div>

      {/* Remaining */}
      <div className="rounded-md border border-border px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Treasury after spending</span>
        <span className={`font-mono font-bold text-lg ${remaining < 0 ? 'text-destructive' : 'text-gold'}`}>
          {remaining} gc
        </span>
      </div>

      {warbandId && (
        <Link
          href={`/warbands/${warbandId}`}
          target="_blank"
          className="block text-center text-sm text-gold hover:underline"
        >
          Open warband roster to hire warriors / buy equipment →
        </Link>
      )}
    </div>
  )
}
