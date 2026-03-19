import Link from 'next/link'
import { getFactionTheme } from '@/lib/faction-theme'

interface StandingRow {
  rank: number
  warbandId: string
  warbandName: string
  playerName: string
  factionName: string
  gp: number
  wins: number
  draws: number
  losses: number
  vp: number
  wr: number
  territories: number
}

interface StandingsTableProps {
  rows: StandingRow[]
  currentUserId?: string
  currentWarbandIds?: string[]
  pointsWin: number
  pointsDraw: number
  pointsLoss: number
}

export function StandingsTable({ rows, currentWarbandIds = [], pointsWin, pointsDraw, pointsLoss }: StandingsTableProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No warbands yet.</p>
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground/60">
        Scoring: W{pointsWin} D{pointsDraw} L{pointsLoss} · VP = Victory Points · WR = Warband Rating · Terr = Territories
      </p>
      <div className="rounded-md border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {['#', 'Warband', 'Player', 'Faction', 'GP', 'W', 'D', 'L', 'VP', 'WR', 'Terr'].map((h) => (
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
            {rows.map((row) => {
              const isOwn = currentWarbandIds.includes(row.warbandId)
              const theme = getFactionTheme(row.factionName)
              return (
                <tr
                  key={row.warbandId}
                  className={`transition-colors hover:bg-muted/10 ${isOwn ? 'bg-gold/5 ring-1 ring-inset ring-gold/20' : ''}`}
                >
                  <td className="pl-4 pr-3 py-3 text-muted-foreground font-mono text-xs">{row.rank}</td>
                  <td className="px-3 py-3">
                    <Link href={`/warbands/${row.warbandId}`} className={`hover:text-gold transition-colors ${isOwn ? 'text-gold/90' : 'text-foreground'}`}>
                      {row.warbandName}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{row.playerName}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span>{theme.icon}</span>
                      <span>{row.factionName}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.gp}</td>
                  <td className="px-3 py-3 font-mono text-xs text-emerald-400">{row.wins}</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.draws}</td>
                  <td className="px-3 py-3 font-mono text-xs text-red-400/70">{row.losses}</td>
                  <td className="px-3 py-3 font-mono text-xs font-bold text-gold">{row.vp}</td>
                  <td className="px-3 py-3 font-mono text-xs">{row.wr}</td>
                  <td className="pr-4 pl-3 py-3 font-mono text-xs text-right text-muted-foreground">{row.territories}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
