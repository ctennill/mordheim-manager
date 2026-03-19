import { type Territory, type WarbandTerritory, type Warband } from '@/types/database'
import { TerritoryCard } from './territory-card'
import { formulaLabel } from '@/lib/game-rules/territory-income'
import { getFactionTheme } from '@/lib/faction-theme'

type WarbandRow = Pick<Warband, 'id' | 'name'> & {
  factions?: { name: string } | null
}

type HoldingRow = WarbandTerritory & {
  territories: Territory
  warbands: WarbandRow
}

interface CampaignTerritoryMapProps {
  holdings: HoldingRow[]
  allTerritories: Territory[]
  isCommissioner: boolean
  campaignId: string
}

export function CampaignTerritoryMap({
  holdings, allTerritories, isCommissioner, campaignId,
}: CampaignTerritoryMapProps) {
  // Group holdings by warband
  const byWarband = new Map<string, { warband: WarbandRow; territories: HoldingRow[] }>()
  for (const h of holdings) {
    const existing = byWarband.get(h.warband_id)
    if (existing) {
      existing.territories.push(h)
    } else {
      byWarband.set(h.warband_id, { warband: h.warbands, territories: [h] })
    }
  }

  const heldTerritoryIds = new Set(holdings.map((h) => h.territory_id))
  const unclaimed = allTerritories.filter((t) => !heldTerritoryIds.has(t.id))

  return (
    <div className="space-y-8">
      {/* Per-warband sections */}
      {byWarband.size === 0 && (
        <p className="text-sm text-muted-foreground">No territories have been claimed in this campaign yet.</p>
      )}

      {[...byWarband.entries()].map(([warbandId, { warband, territories }]) => {
        const theme = getFactionTheme(warband.factions?.name ?? '')
        const totalIncome = territories.reduce((sum, h) => {
          const label = formulaLabel(h.territories.income_formula ?? 'none')
          return label === 'No income' ? sum : sum
        }, 0)

        return (
          <section key={warbandId} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{theme.icon}</span>
                <h3 className="font-semibold text-foreground">{warband.name}</h3>
                <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
                  {territories.length} {territories.length === 1 ? 'territory' : 'territories'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {territories.map((h) => (
                <TerritoryCard
                  key={h.id}
                  territory={h.territories}
                  holding={h}
                />
              ))}
            </div>
          </section>
        )
      })}

      {/* Unclaimed territories */}
      {unclaimed.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground/60">
            Unclaimed ({unclaimed.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {unclaimed.map((t) => (
              <div key={t.id} className="rounded border border-border/50 bg-card/50 px-3 py-2 opacity-60">
                <p className="text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{formulaLabel(t.income_formula ?? 'none')}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
