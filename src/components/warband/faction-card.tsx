import Link from 'next/link'
import { type Faction } from '@/types/database'
import { getFactionTheme, ALIGNMENT_LABELS } from '@/lib/faction-theme'

interface FactionCardProps {
  faction: Faction
}

const RULESET_LABELS: Record<string, string> = {
  core:         'Core',
  town_cryer:   'Town Cryer',
  community:    'Community Edition',
}

const TYPE_LABELS: Record<string, string> = {
  official:   'Official',
  supplement: 'Supplement',
  custom:     'Custom',
}

export function FactionCard({ faction }: FactionCardProps) {
  const theme = getFactionTheme(faction.name)
  const alignmentStyle = faction.alignment
    ? ALIGNMENT_LABELS[faction.alignment]
    : null

  return (
    <Link
      href={`/factions/${faction.id}`}
      className={`group block rounded-md border bg-card p-5 space-y-4 transition-colors ${theme.borderClass} ${theme.bgClass}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{theme.icon}</span>
          <h3
            className={`font-bold text-base leading-tight group-hover:underline ${theme.accentClass}`}
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            {faction.name}
          </h3>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-block px-2 py-0.5 rounded text-[11px] border border-border text-muted-foreground">
          {TYPE_LABELS[faction.type] ?? faction.type}
        </span>
        <span className="inline-block px-2 py-0.5 rounded text-[11px] border border-border text-muted-foreground">
          {RULESET_LABELS[faction.ruleset] ?? faction.ruleset}
        </span>
        {alignmentStyle && (
          <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${alignmentStyle.className}`}>
            {alignmentStyle.label}
          </span>
        )}
      </div>

      {/* Special rules preview — first 2 */}
      {faction.special_rules.length > 0 && (
        <ul className="space-y-1">
          {faction.special_rules.slice(0, 2).map((rule, i) => (
            <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
              <span className={`mt-0.5 shrink-0 ${theme.accentClass}`}>▸</span>
              <span>{rule.split(':')[0]}</span>
            </li>
          ))}
          {faction.special_rules.length > 2 && (
            <li className="text-xs text-muted-foreground/50 italic pl-4">
              +{faction.special_rules.length - 2} more rules
            </li>
          )}
        </ul>
      )}

      {/* Footer stats */}
      <div className="flex gap-4 pt-1 border-t border-border text-xs text-muted-foreground">
        <span>{faction.starting_gold} gc starting gold</span>
        <span>·</span>
        <span>Up to {faction.max_warband_size} models</span>
      </div>
    </Link>
  )
}
