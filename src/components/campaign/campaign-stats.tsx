interface CampaignStatsProps {
  totalBattles: number
  totalDeaths: number
  totalPromotions: number
  totalWyrdstone: number
  mostExperiencedWarrior: { name: string | null; warbandName: string; xp: number } | null
  topWarband: { name: string; vp: number; wr: number } | null
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3 space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">{label}</p>
      <p className="text-lg font-mono text-foreground">{value}</p>
    </div>
  )
}

export function CampaignStats({
  totalBattles,
  totalDeaths,
  totalPromotions,
  totalWyrdstone,
  mostExperiencedWarrior,
  topWarband,
}: CampaignStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Battles Fought" value={String(totalBattles)} />
        <StatCard label="Warriors Slain" value={String(totalDeaths)} />
        <StatCard label="Promotions" value={String(totalPromotions)} />
        <StatCard label="Wyrdstone Collected" value={String(totalWyrdstone)} />
      </div>

      {(mostExperiencedWarrior || topWarband) && (
        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground/60">Warriors of Note</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mostExperiencedWarrior && (
              <div className="rounded-md border border-border bg-card px-4 py-3 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Most Experienced Hero</p>
                <p className="text-foreground font-semibold">{mostExperiencedWarrior.name ?? 'Unnamed Warrior'}</p>
                <p className="text-xs text-muted-foreground">{mostExperiencedWarrior.warbandName}</p>
                <p className="text-sm font-mono text-gold">{mostExperiencedWarrior.xp} XP</p>
              </div>
            )}
            {topWarband && (
              <div className="rounded-md border border-border bg-card px-4 py-3 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Leading Warband</p>
                <p className="text-foreground font-semibold">{topWarband.name}</p>
                <p className="text-sm font-mono text-gold">{topWarband.vp} VP</p>
                <p className="text-xs text-muted-foreground font-mono">Rating: {topWarband.wr}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
