interface BattleLogEntry {
  id: string
  warbandAName: string
  warbandBName: string
  resultA: string | null
  resultB: string | null
  wyrdstoneA: number
  wyrdstoneB: number
  playedAt: string | null
}

interface BattleLogProps {
  battles: BattleLogEntry[]
}

function resultLabel(r: string | null): { text: string; className: string } {
  if (r === 'win') return { text: 'W', className: 'text-emerald-400 font-semibold' }
  if (r === 'loss') return { text: 'L', className: 'text-red-400' }
  return { text: 'D', className: 'text-muted-foreground' }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function BattleLog({ battles }: BattleLogProps) {
  if (battles.length === 0) {
    return <p className="text-sm text-muted-foreground">No battles played yet.</p>
  }

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            {['#', 'Warband A', 'Result', 'Warband B', 'Wyrdstone', 'Date'].map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium text-left first:pl-4 last:pr-4 last:text-right"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {battles.map((battle, idx) => {
            const a = resultLabel(battle.resultA)
            const b = resultLabel(battle.resultB)
            return (
              <tr key={battle.id} className="hover:bg-muted/10 transition-colors">
                <td className="pl-4 pr-3 py-3 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                <td className="px-3 py-3 text-foreground">{battle.warbandAName}</td>
                <td className="px-3 py-3 font-mono text-xs">
                  <span className={a.className}>{a.text}</span>
                  <span className="text-muted-foreground/40 mx-0.5">–</span>
                  <span className={b.className}>{b.text}</span>
                </td>
                <td className="px-3 py-3 text-foreground">{battle.warbandBName}</td>
                <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                  {battle.wyrdstoneA}+{battle.wyrdstoneB}
                </td>
                <td className="pr-4 pl-3 py-3 text-xs text-muted-foreground text-right">{formatDate(battle.playedAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
