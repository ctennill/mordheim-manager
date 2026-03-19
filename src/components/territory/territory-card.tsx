import { type Territory, type WarbandTerritory } from '@/types/database'
import { formulaLabel } from '@/lib/game-rules/territory-income'

type TerritoryCardProps = {
  territory: Territory
  holding?: WarbandTerritory
  /** Show a "Challenge" button (opponent view) */
  showChallenge?: boolean
  /** Show a "Remove" button (commissioner view) */
  onRemove?: () => void
  compact?: boolean
}

const ACQUIRED_LABELS: Record<string, string> = {
  exploration: 'Exploration',
  battle_reward: 'Battle',
  commissioner: 'Commissioner',
}

export function TerritoryCard({ territory, holding, showChallenge, onRemove, compact }: TerritoryCardProps) {
  const incomeLabel = formulaLabel(territory.income_formula ?? 'none')
  const hasIncome = territory.income_formula && territory.income_formula !== 'none'

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded border border-border bg-card px-3 py-2">
        <div className="min-w-0">
          <span className="text-sm text-foreground font-medium truncate">{territory.name}</span>
          {hasIncome && (
            <span className="text-xs text-gold ml-2">{incomeLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {holding && (
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
              {ACQUIRED_LABELS[holding.acquired_via ?? ''] ?? holding.acquired_via ?? ''}
            </span>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-destructive hover:text-destructive/80 border border-destructive/30 rounded px-1.5 py-0.5 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{territory.name}</h3>
          {holding && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Acquired via {ACQUIRED_LABELS[holding.acquired_via ?? ''] ?? holding.acquired_via ?? 'unknown'}
              {' · '}
              {new Date(holding.acquired_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          {hasIncome ? (
            <span className="text-sm font-mono text-gold font-semibold">{incomeLabel}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Special only</span>
          )}
        </div>
      </div>

      {territory.description && (
        <p className="text-xs text-muted-foreground italic leading-relaxed">{territory.description}</p>
      )}

      {territory.special_rules && (
        <div className="rounded border border-border/60 bg-muted/20 px-3 py-2">
          <p className="text-xs text-muted-foreground/70 uppercase tracking-widest mb-1">Special Rule</p>
          <p className="text-xs text-foreground">{territory.special_rules}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {showChallenge && (
          <button
            type="button"
            className="px-3 py-1 text-xs rounded border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
          >
            Challenge for Territory
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="px-3 py-1 text-xs rounded border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
          >
            Remove Territory
          </button>
        )}
      </div>
    </div>
  )
}
