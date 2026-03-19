import { type FactionPosition } from '@/types/database'

interface FactionRosterTableProps {
  positions: FactionPosition[]
}

const STAT_HEADERS = ['M', 'WS', 'BS', 'S', 'T', 'W', 'I', 'A', 'Ld']

function formatAllowance(pos: FactionPosition): string {
  if (pos.is_leader) return `${pos.warrior_type === 'hero' ? 'Hero' : 'Henchmen'} (1 only)`
  if (pos.min_count > 0) {
    return `${pos.warrior_type === 'hero' ? 'Hero' : 'Henchmen'} (${pos.min_count}–${pos.max_count})`
  }
  return `${pos.warrior_type === 'hero' ? 'Hero' : 'Henchmen'} (0–${pos.max_count})`
}

export function FactionRosterTable({ positions }: FactionRosterTableProps) {
  const heroes = positions.filter((p) => p.warrior_type === 'hero')
  const henchmen = positions.filter((p) => p.warrior_type === 'henchman')

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">
              Position
            </th>
            <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wide whitespace-nowrap">
              Type
            </th>
            {STAT_HEADERS.map((h) => (
              <th
                key={h}
                className="text-center py-2 px-1.5 text-muted-foreground font-medium text-xs uppercase tracking-wide w-8"
              >
                {h}
              </th>
            ))}
            <th className="text-left py-2 pl-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">
              Special
            </th>
            <th className="text-right py-2 text-muted-foreground font-medium text-xs uppercase tracking-wide whitespace-nowrap">
              Cost
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Heroes section */}
          {heroes.length > 0 && (
            <>
              <tr>
                <td
                  colSpan={STAT_HEADERS.length + 4}
                  className="pt-3 pb-1 text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium"
                >
                  Heroes
                </td>
              </tr>
              {heroes.map((pos) => (
                <RosterRow key={pos.id} position={pos} />
              ))}
            </>
          )}

          {/* Henchmen section */}
          {henchmen.length > 0 && (
            <>
              <tr>
                <td
                  colSpan={STAT_HEADERS.length + 4}
                  className="pt-4 pb-1 text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium"
                >
                  Henchmen
                </td>
              </tr>
              {henchmen.map((pos) => (
                <RosterRow key={pos.id} position={pos} />
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

function RosterRow({ position: p }: { position: FactionPosition }) {
  const stats = [
    p.move, p.weapon_skill, p.ballistic_skill, p.strength,
    p.toughness, p.wounds, p.initiative, p.attacks, p.leadership,
  ]

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-2 pr-4 font-medium text-foreground whitespace-nowrap">
        {p.name}
        {p.is_leader && (
          <span className="ml-2 text-[10px] text-gold border border-gold/30 rounded px-1 py-0.5">
            Leader
          </span>
        )}
      </td>
      <td className="py-2 pr-4 text-muted-foreground text-xs whitespace-nowrap">
        {formatAllowance(p)}
      </td>
      {stats.map((val, i) => (
        <td key={i} className="py-2 px-1.5 text-center font-mono text-sm text-foreground">
          {val}
        </td>
      ))}
      <td className="py-2 pl-4 text-xs text-muted-foreground">
        {p.special_rules.length > 0 ? p.special_rules.join(', ') : '—'}
      </td>
      <td className="py-2 text-right font-medium text-gold whitespace-nowrap">
        {p.cost} gc
      </td>
    </tr>
  )
}
