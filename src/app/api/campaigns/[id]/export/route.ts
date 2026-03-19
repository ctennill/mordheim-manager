import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Campaign } from '@/types/database'

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

function csvEscape(value: string | number | null | undefined): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, commissioner_id, points_win, points_draw, points_loss')
    .eq('id', campaignId)
    .single() as {
      data: Pick<Campaign, 'id' | 'name' | 'commissioner_id' | 'points_win' | 'points_draw' | 'points_loss'> | null
    }

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  // Auth: must be commissioner or approved participant
  const isCommissioner = campaign.commissioner_id === user.id
  if (!isCommissioner) {
    const { data: cp } = await supabase
      .from('campaign_players')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('player_id', user.id)
      .eq('approval_status', 'approved')
      .maybeSingle()
    if (!cp) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  // Fetch wyrdstone
  let wyrdstoneByWarband: Record<string, number> = {}
  if (warbandIds.length > 0) {
    const { data: battles } = await supabase
      .from('battles')
      .select('warband_a_id, warband_b_id, wyrdstone_a, wyrdstone_b')
      .eq('campaign_id', campaignId)
      .not('result_a', 'is', null) as {
        data: { warband_a_id: string; warband_b_id: string; wyrdstone_a: number; wyrdstone_b: number }[] | null
      }
    for (const b of battles ?? []) {
      wyrdstoneByWarband[b.warband_a_id] = (wyrdstoneByWarband[b.warband_a_id] ?? 0) + b.wyrdstone_a
      wyrdstoneByWarband[b.warband_b_id] = (wyrdstoneByWarband[b.warband_b_id] ?? 0) + b.wyrdstone_b
    }
  }

  const rows = players
    .filter((p) => p.warbands)
    .map((p) => {
      const wb = p.warbands!
      const gp = wb.wins + wb.draws + wb.losses
      const vp = wb.wins * campaign.points_win + wb.draws * campaign.points_draw + wb.losses * campaign.points_loss
      return {
        rank: 0,
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
        treasury: wb.treasury,
      }
    })
    .sort((a, b) => b.vp - a.vp || b.wr - a.wr)
    .map((row, idx) => ({ ...row, rank: idx + 1 }))

  const header = ['Rank', 'Warband', 'Player', 'Faction', 'GP', 'W', 'D', 'L', 'VP', 'WR', 'Territories', 'Treasury']
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [r.rank, r.warbandName, r.playerName, r.factionName, r.gp, r.wins, r.draws, r.losses, r.vp, r.wr, r.territories, r.treasury]
        .map(csvEscape)
        .join(',')
    ),
  ]

  const csv = lines.join('\r\n')
  const filename = `${campaign.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-standings.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
