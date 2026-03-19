'use client'

import { calcWyrdstoneIncome } from '@/lib/game-rules/wyrdstone-income'

interface StepWyrdstoneProps {
  shards: number
  onChange: (shards: number) => void
}

export function StepWyrdstone({ shards, onChange }: StepWyrdstoneProps) {
  const income = calcWyrdstoneIncome(shards)

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Record the number of Wyrdstone shards your warband collected during the battle.
        This determines your base income in the post-battle sequence.
      </p>

      <div className="flex flex-col items-center gap-6 py-4">
        {/* Big counter */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, shards - 1))}
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border hover:border-gold/40 text-2xl text-muted-foreground hover:text-foreground transition-colors"
          >
            −
          </button>
          <div className="text-center">
            <div className="text-5xl font-bold font-mono text-gold">{shards}</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Shards</div>
          </div>
          <button
            type="button"
            onClick={() => onChange(shards + 1)}
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border hover:border-gold/40 text-2xl text-muted-foreground hover:text-foreground transition-colors"
          >
            +
          </button>
        </div>

        {/* Income preview */}
        <div className="rounded-md border border-gold/20 bg-gold/5 px-6 py-4 text-center min-w-48">
          <p className="text-xs uppercase tracking-widest text-gold/70">Base Income</p>
          <p className="text-2xl font-mono font-bold text-gold mt-1">
            {income > 0 ? `${income} gc` : '—'}
          </p>
        </div>
      </div>

      {/* Reference table */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Shards</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Income (gc)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[1,2,3,4,5,6].map((n) => (
              <tr key={n} className={`${shards === n ? 'bg-gold/10' : ''} transition-colors`}>
                <td className="px-3 py-1.5 text-foreground">{n}{n === 6 ? '+' : ''}</td>
                <td className="px-3 py-1.5 text-right font-mono text-foreground">{calcWyrdstoneIncome(n)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
