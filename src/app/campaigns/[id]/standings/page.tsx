import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { type Campaign } from '@/types/database'
import { StandingsTable } from '@/components/campaign/standings-table'
import { WarriorsLeaderboard } from '@/components/campaign/warriors-leaderboard'
import { BattleLog } from '@/components/campaign/battle-log'
import { CampaignStats } from '@/components/campaign/campaign-stats'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

type PlayerRow = {
  player_id: string
  warband_id: string
  profiles: { display_name: string | null; username: string } | null
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

type WarriorSelectRow = {
  id: string
  name: string | null
  warrior_type: string
  experience: number
  advancements_taken: number
  warband_id: string
}

type BattleSelectRow = {
  id: string
  warband_a_id: string
  warband_b_id: string
  result_a: string | null
  result_b: string | null
  wyrdstone_a: number
  wyrdstone_b: number
  played_at: string | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('campaigns').select('name').eq('id', id).single() as { data: { name: string } | null }
  return { title: data ? `${data.name} — Standings` : 'Standings — Mordheim Manager' }
}

const TABS = [
  { key: 'standings', label: 'Standings' },
  { key: 'warriors', label: 'Warriors' },
  { key: 'battles', label: 'Battles' },
  { key: 'stats', label: 'Stats' },
]

export default async function StandingsPage({ params, searchParams }: PageProps) {
  const { id: campaignId } = await params
  const { tab: rawTab } = await searchParams
  const tab = TABS.some((t) => t.key === rawTab) ? (rawTab ?? 'standings') : 'standings'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, commissioner_id, points_win, points_draw, points_loss, current_session, status')
    .eq('id', campaignId)
    .single() as {
      data: Pick<Campaign, 'id' | 'name' | 'commissioner_id' | 'points_win' | 'points_draw' | 'points_loss' | 'current_session' | 'status'> | null
    }

  if (!campaign) notFound()

  const { data: playerRows } = await supabase
    .from('campaign_players')
    .select(`
      player_id, warband_id,
      profiles:player_id(display_name, username),
      warbands:warband_id(id, name, wins, losses, draws, warband_rating, treasury, factions:faction_id(name))
    `)
    .eq('campaign_id', campaignId)
    .eq('approval_status', 'approved') as unknown as { data: PlayerRow[] | null }

  const players = playerRows ?? []
  const warbandIds = players.map((p) => p.warband_id).filter(Boolean)

  const { data: territoryRows } = await supabase
    .from('warband_territories')
    .select('warband_id')
    .eq('campaign_id', campaignId) as { data: { warband_id: string }[] | null }

  const territoryCounts: Record<string, number> = {}
  for (const t of territoryRows ?? []) {
    territoryCounts[t.warband_id] = (territoryCounts[t.warband_id] ?? 0) + 1
  }

  const warbandMap: Record<string, { name: string; factionName: string }> = {}
  for (const p of players) {
    if (p.warbands) {
      warbandMap[p.warband_id] = {
        name: p.warbands.name,
        factionName: p.warbands.factions?.name ?? 'Unknown',
      }
    }
  }

  const standingRows = players
    .filter((p) => p.warbands)
    .map((p) => {
      const wb = p.warbands!
      const gp = wb.wins + wb.draws + wb.losses
      const vp = wb.wins * campaign.points_win + wb.draws * campaign.points_draw + wb.losses * campaign.points_loss
      return {
        rank: 0,
        warbandId: p.warband_id,
        warbandName: wb.name,
        playerName: p.profiles?.display_name ?? p.profiles?.username ?? 'Unknown',
        factionName: wb.factions?.name ?? 'Unknown',
        gp,
        wins: wb.wins,
        draws: wb.draws,
        losses: wb.losses,
        vp,
        wr: wb.warband_rating,
        territories: territoryCounts[p.warband_id] ?? 0,
      }
    })
    .sort((a, b) => b.vp - a.vp || b.wr - a.wr)
    .map((row, idx) => ({ ...row, rank: idx + 1 }))

  const currentWarbandIds = user
    ? players.filter((p) => p.player_id === user.id).map((p) => p.warband_id)
    : []

  let warriorRows: WarriorSelectRow[] = []
  let battleRows: BattleSelectRow[] = []
  let deathCount: number | null = null
  let promotionCount: number | null = null
  let totalWyrdstone = 0
  let totalBattleCount = 0

  if (tab === 'warriors' && warbandIds.length > 0) {
    const { data } = await supabase
      .from('warriors')
      .select('id, name, warrior_type, experience, advancements_taken, warband_id')
      .in('warband_id', warbandIds)
      .neq('status', 'dead')
      .order('experience', { ascending: false })
      .limit(50) as unknown as { data: WarriorSelectRow[] | null }
    warriorRows = data ?? []
  }

  if (tab === 'battles') {
    const { data } = await supabase
      .from('battles')
      .select('id, warband_a_id, warband_b_id, result_a, result_b, wyrdstone_a, wyrdstone_b, played_at')
      .eq('campaign_id', campaignId)
      .not('result_a', 'is', null)
      .order('played_at', { ascending: false })
      .limit(50) as unknown as { data: BattleSelectRow[] | null }
    battleRows = data ?? []
  }

  if (tab === 'stats') {
    const queries: Promise<unknown>[] = [
      supabase
        .from('battles')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .not('result_a', 'is', null) as unknown as Promise<{ count: number | null }>,
      supabase
        .from('battles')
        .select('wyrdstone_a, wyrdstone_b')
        .eq('campaign_id', campaignId)
        .not('result_a', 'is', null) as unknown as Promise<{ data: { wyrdstone_a: number; wyrdstone_b: number }[] | null }>,
    ]

    if (warbandIds.length > 0) {
      queries.push(
        supabase
          .from('warriors')
          .select('id', { count: 'exact', head: true })
          .in('warband_id', warbandIds)
          .eq('status', 'dead') as unknown as Promise<{ count: number | null }>,
        supabase
          .from('warriors')
          .select('id', { count: 'exact', head: true })
          .in('warband_id', warbandIds)
          .eq('is_promoted', true) as unknown as Promise<{ count: number | null }>,
      )
    }

    const results = await Promise.all(queries)
    const battleCountRes = results[0] as { count: number | null }
    const wyrdstoneRes = results[1] as { data: { wyrdstone_a: number; wyrdstone_b: number }[] | null }
    totalBattleCount = battleCountRes.count ?? 0

    for (const b of wyrdstoneRes.data ?? []) {
      totalWyrdstone += b.wyrdstone_a + b.wyrdstone_b
    }

    if (warbandIds.length > 0) {
      deathCount = (results[2] as { count: number | null }).count ?? 0
      promotionCount = (results[3] as { count: number | null }).count ?? 0
    } else {
      deathCount = 0
      promotionCount = 0
    }
  }

  const mappedWarriors = warriorRows.map((w) => ({
    id: w.id,
    name: w.name,
    warrior_type: w.warrior_type,
    experience: w.experience,
    advancements_taken: w.advancements_taken,
    warbandName: warbandMap[w.warband_id]?.name ?? 'Unknown',
    factionName: warbandMap[w.warband_id]?.factionName ?? 'Unknown',
  }))

  const mappedBattles = battleRows.map((b) => ({
    id: b.id,
    warbandAName: warbandMap[b.warband_a_id]?.name ?? 'Unknown',
    warbandBName: warbandMap[b.warband_b_id]?.name ?? 'Unknown',
    resultA: b.result_a,
    resultB: b.result_b,
    wyrdstoneA: b.wyrdstone_a,
    wyrdstoneB: b.wyrdstone_b,
    playedAt: b.played_at,
  }))

  const topStanding = standingRows[0] ?? null
  const topWarband = topStanding
    ? { name: topStanding.warbandName, vp: topStanding.vp, wr: topStanding.wr }
    : null

  const topHero =
    tab === 'stats' && warriorRows.length === 0
      ? null
      : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <Link
          href={`/campaigns/${campaignId}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {campaign.name}
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-cinzel text-2xl font-bold text-foreground">
            {campaign.name} — Standings
          </h1>
          <span className="text-xs px-2.5 py-1 rounded border border-border text-muted-foreground font-mono">
            Session {campaign.current_session}
          </span>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const active = t.key === tab
          return (
            <Link
              key={t.key}
              href={`/campaigns/${campaignId}/standings?tab=${t.key}`}
              className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
                active
                  ? 'border-gold text-gold bg-gold/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>

      <div>
        {tab === 'standings' && (
          <StandingsTable
            rows={standingRows}
            currentUserId={user?.id}
            currentWarbandIds={currentWarbandIds}
            pointsWin={campaign.points_win}
            pointsDraw={campaign.points_draw}
            pointsLoss={campaign.points_loss}
          />
        )}

        {tab === 'warriors' && (
          <WarriorsLeaderboard warriors={mappedWarriors} />
        )}

        {tab === 'battles' && (
          <BattleLog battles={mappedBattles} />
        )}

        {tab === 'stats' && (
          <CampaignStats
            totalBattles={totalBattleCount}
            totalDeaths={deathCount ?? 0}
            totalPromotions={promotionCount ?? 0}
            totalWyrdstone={totalWyrdstone}
            mostExperiencedWarrior={topHero}
            topWarband={topWarband}
          />
        )}
      </div>
    </div>
  )
}
