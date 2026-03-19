import { getFactionTheme } from '@/lib/faction-theme'

interface WarriorRow {
  id: string
  name: string | null
  warrior_type: string
  experience: number
  advancements_taken: number
  warbandName: string
  factionName: string
}

interface WarriorsLeaderboardProps {
  warriors: WarriorRow[]
}

export function WarriorsLeaderboard({ warriors }: WarriorsLeaderboardProps) {
  const heroes = warriors.filter((w) => w.warrior_type === 'hero').slice(0, 20)

  if (heroes.length === 0) {
    return <p className="text-sm text-muted-foreground">No warriors yet.</p>
  }

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            {['Rank', 'Name', 'Type', 'Warband', 'Faction', 'XP', 'Advances'].map((h) => (
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
          {heroes.map((warrior, idx) => {
            const theme = getFactionTheme(warrior.factionName)
            return (
              <tr key={warrior.id} className="hover:bg-muted/10 transition-colors">
                <td className="pl-4 pr-3 py-3 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                <td className="px-3 py-3 text-foreground">{warrior.name ?? '—'}</td>
                <td className="px-3 py-3 text-muted-foreground capitalize text-xs">{warrior.warrior_type}</td>
                <td className="px-3 py-3 text-muted-foreground">{warrior.warbandName}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span>{theme.icon}</span>
                    <span>{warrior.factionName}</span>
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-gold font-semibold">{warrior.experience}</td>
                <td className="pr-4 pl-3 py-3 font-mono text-xs text-muted-foreground text-right">{warrior.advancements_taken}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
