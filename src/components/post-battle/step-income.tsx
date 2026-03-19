'use client'

import { usePostBattle } from '@/store/post-battle'
import { rollTerritoryIncome, formulaLabel } from '@/lib/game-rules/territory-income'

export function StepIncome() {
  const {
    wyrdstoneShards, baseWyrdstoneIncome, miscIncome, totalIncome, treasuryBefore,
    territories, territoryIncome,
    setMiscIncome, rollTerritoryIncome: setTerritoryRoll,
  } = usePostBattle()

  const newTreasury = treasuryBefore + totalIncome

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review your income for this battle. Gold is added to your treasury before spending.
      </p>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            <Row
              label="Wyrdstone collected"
              sub={`${wyrdstoneShards} shard${wyrdstoneShards !== 1 ? 's' : ''}`}
              value={`${baseWyrdstoneIncome} gc`}
              highlight
            />

            {territories.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3">
                  <div className="text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{formulaLabel(t.formula)}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  {t.rolled !== null ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono text-gold">{t.rolled} gc</span>
                      <button
                        type="button"
                        onClick={() => {
                          const result = rollTerritoryIncome(t.formula)
                          setTerritoryRoll(t.id, result.total)
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                      >
                        reroll
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const result = rollTerritoryIncome(t.formula)
                        setTerritoryRoll(t.id, result.total)
                      }}
                      className="px-3 py-1 rounded border border-border text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors text-xs"
                    >
                      Roll income
                    </button>
                  )}
                </td>
              </tr>
            ))}

            <tr>
              <td className="px-4 py-3">
                <div className="text-foreground">Misc / Scenario Bonus</div>
                <div className="text-xs text-muted-foreground">Commissioner-awarded income</div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMiscIncome(Math.max(0, miscIncome - 5))}
                    className="w-6 h-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-gold/40 transition-colors text-xs"
                  >−</button>
                  <span className="w-14 text-center font-mono text-foreground">{miscIncome} gc</span>
                  <button
                    type="button"
                    onClick={() => setMiscIncome(miscIncome + 5)}
                    className="w-6 h-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-gold/40 transition-colors text-xs"
                  >+</button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/20">
              <td className="px-4 py-3 font-semibold text-foreground">Total Income</td>
              <td className="px-4 py-3 text-right font-bold font-mono text-gold">{totalIncome} gc</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Treasury summary */}
      <div className="rounded-md border border-gold/20 bg-gold/5 px-5 py-4 space-y-2">
        <p className="text-xs uppercase tracking-widest text-gold/70">Treasury Update</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Before battle</span>
          <span className="font-mono text-foreground">{treasuryBefore} gc</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Income this battle</span>
          <span className="font-mono text-emerald-400">+{totalIncome} gc</span>
        </div>
        <div className="h-px bg-border my-1" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">New Total</span>
          <span className="font-mono text-xl font-bold text-gold">{newTreasury} gc</span>
        </div>
      </div>
    </div>
  )
}

function Row({ label, sub, value, highlight }: { label: string; sub?: string; value: string; highlight?: boolean }) {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="text-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </td>
      <td className={`px-4 py-3 text-right font-mono ${highlight ? 'text-gold' : 'text-foreground'}`}>{value}</td>
    </tr>
  )
}
