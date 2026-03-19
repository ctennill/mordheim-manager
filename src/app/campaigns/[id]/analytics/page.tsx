import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { type Campaign } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('campaigns').select('name').eq('id', id).single() as { data: { name: string } | null }
  return { title: data ? `${data.name} — Analytics` : 'Campaign Analytics — Mordheim Manager' }
}

type PlayerRow = {
  player_id: string
  warband_id: string
  warbands: {
    id: string
    name: string
    wins: number
    losses: number
    draws: number
    warband_rating: number
    treasury: number
    factions: { name: string } | null
  } | null
}

type WarriorRow = {
  id: string
  name: string | null
  warrior_type: string
  experience: number
  status: string
  warband_id: string
  group_count: number
}

type BattleRow = {
  id: string
  warband_a_id: string
  warband_b_id: string
  result_a: string | null
  result_b: string | null
  wyrdstone_a: number
  wyrdstone_b: number
}

export default async function CampaignAnalyticsPage({ params }: PageProps) {
  const { id: campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, commissioner_id, points_win, points_draw, points_loss, current_session, status')
    .eq('id', campaignId)
    .single() as {
      data: Pick<Campaign, 'id' | 'name' | 'commissioner_id' | 'points_win' | 'points_draw' | 'points_loss' | 'current_session' | 'status'> | null
    }

  if (!campaign) notFound()

  const isCommissioner = campaign.commissioner_id === user.id

  // Auth: commissioner or approved participant
  if (!isCommissioner) {
    const { data: cp } = await supabase
      .from('campaign_players')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('player_id', user.id)
      .eq('approval_status', 'approved')
      .maybeSingle()
    if (!cp) redirect(`/campaigns/${campaignId}`)
  }

  // Fetch all data in parallel
  const [playerRes, battleRes, territoryRes] = await Promise.all([
    supabase
      .from('campaign_players')
      .select(`
        player_id, warband_id,
        warbands:warband_id(id, name, wins, losses, draws, warband_rating, treasury, factions:faction_id(name))
      `)
      .eq('campaign_id', campaignId)
      .eq('approval_status', 'approved') as unknown as Promise<{ data: PlayerRow[] | null }>,
    supabase
      .from('battles')
      .select('id, warband_a_id, warband_b_id, result_a, result_b, wyrdstone_a, wyrdstone_b')
      .eq('campaign_id', campaignId)
      .not('result_a', 'is', null) as unknown as Promise<{ data: BattleRow[] | null }>,
    supabase
      .from('warband_territories')
      .select('warband_id')
      .eq('campaign_id', campaignId) as unknown as Promise<{ data: { warband_id: string }[] | null }>,
  ])

  const players = playerRes.data ?? []
  const battles = battleRes.data ?? []
  const territories = territoryRes.data ?? []
  const warbandIds = players.map((p) => p.warband_id).filter(Boolean)

  // Fetch warriors
  let allWarriors: WarriorRow[] = []
  if (warbandIds.length > 0) {
    const { data } = await supabase
      .from('warriors')
      .select('id, name, warrior_type, experience, status, warband_id, group_count')
      .in('warband_id', warbandIds) as unknown as { data: WarriorRow[] | null }
    allWarriors = data ?? []
  }

  // ── Compute analytics ────────────────────────────────────────────────────────

  const totalBattles = battles.length

  const aliveWarriors = allWarriors.filter((w) => w.status !== 'dead')
  const deadWarriors = allWarriors.filter((w) => w.status === 'dead')
  const totalAlive = aliveWarriors.reduce((s, w) => s + w.group_count, 0)
  const totalDead = deadWarriors.reduce((s, w) => s + w.group_count, 0)

  const territoryCounts: Record<string, number> = {}
  for (const t of territories) {
    territoryCounts[t.warband_id] = (territoryCounts[t.warband_id] ?? 0) + 1
  }
  const totalTerritories = territories.length

  const warbandStats = players
    .filter((p) => p.warbands)
    .map((p) => {
      const wb = p.warbands!
      const gp = wb.wins + wb.draws + wb.losses
      const vp = wb.wins * campaign.points_win + wb.draws * campaign.points_draw + wb.losses * campaign.points_loss
      const winPct = gp > 0 ? Math.round((wb.wins / gp) * 100) : 0
      return {
        warbandId: p.warband_id,
        warbandName: wb.name,
        factionName: wb.factions?.name ?? 'Unknown',
        wins: wb.wins,
        losses: wb.losses,
        draws: wb.draws,
        gp,
        vp,
        wr: wb.warband_rating,
        territories: territoryCounts[p.warband_id] ?? 0,
        treasury: wb.treasury,
        winPct,
      }
    })
    .sort((a, b) => b.vp - a.vp || b.wr - a.wr)

  const ratings = warbandStats.map((w) => w.wr)
  const minRating = ratings.length > 0 ? Math.min(...ratings) : 0
  const maxRating = ratings.length > 0 ? Math.max(...ratings) : 0
  const avgRating = ratings.length > 0 ? Math.round(ratings.reduce((s, r) => s + r, 0) / ratings.length) : 0
  const ratingGap = maxRating - minRating

  // Draw/decisive rate
  const totalResults = totalBattles // each battle counts once
  const drawBattles = battles.filter((b) => b.result_a === 'draw').length
  const drawPct = totalResults > 0 ? Math.round((drawBattles / totalResults) * 100) : 0
  const decisivePct = 100 - drawPct

  // Most experienced hero
  const heroWarriors = allWarriors.filter((w) => w.warrior_type === 'hero')
  const topHero = heroWarriors.sort((a, b) => b.experience - a.experience)[0] ?? null
  const topHeroWarband = topHero ? warbandStats.find((w) => w.warbandId === topHero.warband_id) : null

  // Warband with most wins
  const topWinWarband = [...warbandStats].sort((a, b) => b.wins - a.wins)[0] ?? null

  // Warband with most territories
  const topTerritoryWarband = [...warbandStats].sort((a, b) => b.territories - a.territories)[0] ?? null

  // Health indicator
  let healthLabel = 'Balanced'
  let healthClass = 'text-emerald-400'
  let healthNote = 'No handicapping needed.'
  if (ratingGap > 100) {
    healthLabel = 'High spread'
    healthClass = 'text-red-400'
    healthNote = 'Consider handicapping weaker warbands.'
  } else if (ratingGap >= 50) {
    healthLabel = 'Moderate spread'
    healthClass = 'text-amber-400'
    healthNote = 'Monitor closely.'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <Link href={`/campaigns/${campaignId}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← {campaign.name}
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-cinzel text-2xl font-bold text-foreground">
            {campaign.name} — Analytics
          </h1>
          <span className="text-xs px-2.5 py-1 rounded border border-border text-muted-foreground font-mono">
            Session {campaign.current_session}
          </span>
        </div>
      </div>

      {/* Campaign Overview */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Campaign Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total Battles" value={String(totalBattles)} />
          <StatCard label="Warriors" value={`${totalAlive} alive, ${totalDead} dead`} />
          <StatCard label="Territory Claims" value={String(totalTerritories)} />
          <StatCard label="Avg Warband Rating" value={String(avgRating)} />
          <StatCard label="WR Gap" value={`${minRating} – ${maxRating} (${ratingGap})`} />
          <StatCard
            label="Battle Outcomes"
            value={`${decisivePct}% decisive / ${drawPct}% draw`}
          />
        </div>
      </section>

      {/* Battle Performance by Warband */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Battle Performance</h2>
        {warbandStats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved warbands yet.</p>
        ) : (
          <div className="rounded-md border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {['#', 'Warband', 'Faction', 'GP', 'Win%', 'WR', 'Territories', 'Treasury'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium text-left first:pl-4 last:pr-4 last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {warbandStats.map((ws, idx) => (
                  <tr key={ws.warbandId} className="hover:bg-muted/10 transition-colors">
                    <td className="pl-4 pr-3 py-3 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <Link href={`/warbands/${ws.warbandId}`} className="text-foreground hover:text-gold transition-colors">
                        {ws.warbandName}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">{ws.factionName}</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{ws.gp}</td>
                    <td className="px-3 py-3 font-mono text-xs">
                      <span className={ws.winPct >= 60 ? 'text-emerald-400' : ws.winPct >= 40 ? 'text-foreground' : 'text-red-400/70'}>
                        {ws.winPct}%
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{ws.wr}</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{ws.territories}</td>
                    <td className="pr-4 pl-3 py-3 text-right font-mono text-xs text-muted-foreground">{ws.treasury} gc</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Top Performers */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Top Performers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topHero ? (
            <div className="rounded-md border border-border bg-card p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Most Experienced Hero</p>
              <p className="text-sm font-semibold text-foreground">{topHero.name ?? 'Unnamed'}</p>
              <p className="text-xs text-gold font-mono">{topHero.experience} XP</p>
              <p className="text-xs text-muted-foreground">{topHeroWarband?.warbandName ?? 'Unknown warband'}</p>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-card p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Most Experienced Hero</p>
              <p className="text-sm text-muted-foreground">No heroes yet</p>
            </div>
          )}

          {topWinWarband ? (
            <div className="rounded-md border border-border bg-card p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Most Wins</p>
              <p className="text-sm font-semibold text-foreground">{topWinWarband.warbandName}</p>
              <p className="text-xs text-emerald-400 font-mono">{topWinWarband.wins} wins</p>
              <p className="text-xs text-muted-foreground">{topWinWarband.factionName}</p>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-card p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Most Wins</p>
              <p className="text-sm text-muted-foreground">No battles yet</p>
            </div>
          )}

          {topTerritoryWarband && topTerritoryWarband.territories > 0 ? (
            <div className="rounded-md border border-border bg-card p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Most Territories</p>
              <p className="text-sm font-semibold text-foreground">{topTerritoryWarband.warbandName}</p>
              <p className="text-xs text-gold font-mono">{topTerritoryWarband.territories} territories</p>
              <p className="text-xs text-muted-foreground">{topTerritoryWarband.factionName}</p>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-card p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Most Territories</p>
              <p className="text-sm text-muted-foreground">No territories yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Health Indicators */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Health Indicators</h2>
        <div className="rounded-md border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-foreground">
              WR spread:{' '}
              <span className="font-mono">{minRating}</span>
              {' – '}
              <span className="font-mono">{maxRating}</span>
              {' '}
              <span className="text-muted-foreground">(gap: {ratingGap})</span>
            </p>
            <span className={`text-sm font-semibold ${healthClass}`}>{healthLabel}</span>
          </div>
          <p className="text-xs text-muted-foreground">{healthNote}</p>

          {/* Visual bar */}
          {ratings.length > 1 && (
            <div className="space-y-1">
              {warbandStats.map((ws) => {
                const pct = maxRating > 0 ? Math.round((ws.wr / maxRating) * 100) : 0
                return (
                  <div key={ws.warbandId} className="flex items-center gap-2 text-xs">
                    <span className="w-32 truncate text-muted-foreground">{ws.warbandName}</span>
                    <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold/60 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-muted-foreground">{ws.wr}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3 space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">{label}</p>
      <p className="text-sm font-mono text-foreground">{value}</p>
    </div>
  )
}
