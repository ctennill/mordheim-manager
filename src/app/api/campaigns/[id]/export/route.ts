import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/server'
import { type Campaign, type Battle } from '@/types/database'

export const runtime = 'nodejs'

type PlayerRow = {
  player_id: string
  warband_id: string
  profiles: { display_name: string | null; username: string } | null
  warbands: {
    id: string; name: string; wins: number; losses: number; draws: number
    warband_rating: number; treasury: number; factions: { name: string } | null
  } | null
}

type WarriorRow = {
  id: string; warband_id: string; name: string | null; warrior_type: string; status: string
  experience: number; advancements_taken: number
  move: number; weapon_skill: number; ballistic_skill: number; strength: number; toughness: number
  wounds: number; initiative: number; attacks: number; leadership: number
  skills: string[]; group_count: number
}

type TerritoryRow = {
  id: string; warband_id: string; acquired_at: string; acquired_via: string | null
  territories: { name: string; income_bonus: number } | null
  warbands: { name: string } | null
}

function csv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((row) =>
    row.map((cell) => {
      const s = String(cell ?? '')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')
  ).join('\r\n')
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
    .single() as { data: Pick<Campaign, 'id' | 'name' | 'commissioner_id' | 'points_win' | 'points_draw' | 'points_loss'> | null }

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

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

  // Fetch all data in parallel
  const [playersRes, battlesRes, territoriesRes] = await Promise.all([
    supabase
      .from('campaign_players')
      .select(`player_id, warband_id,
        profiles:player_id(display_name, username),
        warbands:warband_id(id, name, wins, losses, draws, warband_rating, treasury, factions:faction_id(name))`)
      .eq('campaign_id', campaignId)
      .eq('approval_status', 'approved') as unknown as Promise<{ data: PlayerRow[] | null }>,
    supabase
      .from('battles')
      .select('*')
      .eq('campaign_id', campaignId)
      .not('result_a', 'is', null)
      .order('played_at') as unknown as Promise<{ data: Battle[] | null }>,
    supabase
      .from('warband_territories')
      .select(`id, warband_id, acquired_at, acquired_via,
        territories(*),
        warbands:warband_id(name)`)
      .eq('campaign_id', campaignId)
      .order('acquired_at') as unknown as Promise<{ data: TerritoryRow[] | null }>,
  ])

  const players = playersRes.data ?? []
  const battles = battlesRes.data ?? []
  const territories = territoriesRes.data ?? []
  const warbandIds = players.map((p) => p.warband_id).filter(Boolean)

  // Fetch warriors for all warbands
  const warriorsRes = warbandIds.length > 0
    ? (await supabase
        .from('warriors')
        .select('id, warband_id, name, warrior_type, status, experience, advancements_taken, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, skills, group_count')
        .in('warband_id', warbandIds)
        .order('warrior_type')) as { data: WarriorRow[] | null }
    : { data: [] as WarriorRow[] }

  const warriors = warriorsRes.data ?? []

  // Territory counts for standings
  const territoryCounts: Record<string, number> = {}
  for (const t of territories) {
    territoryCounts[t.warband_id] = (territoryCounts[t.warband_id] ?? 0) + 1
  }

  // ── warbands.csv ─────────────────────────────────────────────────────────────
  const standingsRows = players
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
        gp, wins: wb.wins, draws: wb.draws, losses: wb.losses, vp,
        wr: wb.warband_rating,
        territories: territoryCounts[p.warband_id] ?? 0,
        treasury: wb.treasury,
      }
    })
    .sort((a, b) => b.vp - a.vp || b.wr - a.wr)
    .map((r, i) => ({ ...r, rank: i + 1 }))

  const warbandsCsv = csv([
    ['Rank', 'Warband', 'Player', 'Faction', 'GP', 'W', 'D', 'L', 'VP', 'WR', 'Territories', 'Treasury'],
    ...standingsRows.map((r) => [r.rank, r.warbandName, r.playerName, r.factionName, r.gp, r.wins, r.draws, r.losses, r.vp, r.wr, r.territories, r.treasury]),
  ])

  // ── warriors.csv ─────────────────────────────────────────────────────────────
  // Build warband name lookup
  const warbandNameMap: Record<string, string> = {}
  for (const p of players) {
    if (p.warbands) warbandNameMap[p.warband_id] = p.warbands.name
  }

  const warriorsCsv = csv([
    ['Warband', 'Warrior', 'Type', 'Status', 'Group Count', 'XP', 'Advancements', 'M', 'WS', 'BS', 'S', 'T', 'W', 'I', 'A', 'Ld', 'Skills'],
    ...warriors.map((w) => [
      warbandNameMap[w.warband_id] ?? w.warband_id,
      w.name ?? (w.warrior_type === 'hero' ? 'Hero' : 'Henchmen'),
      w.warrior_type, w.status, w.group_count, w.experience, w.advancements_taken,
      w.move, w.weapon_skill, w.ballistic_skill, w.strength, w.toughness,
      w.wounds, w.initiative, w.attacks, w.leadership,
      w.skills.join('; '),
    ]),
  ])

  // ── battles.csv ──────────────────────────────────────────────────────────────
  const warbandAll = players.reduce<Record<string, string>>((acc, p) => {
    if (p.warbands) acc[p.warband_id] = p.warbands.name
    return acc
  }, {})

  const battlesCsv = csv([
    ['Date', 'Warband A', 'Result A', 'Wyrdstone A', 'Routed A', 'Warband B', 'Result B', 'Wyrdstone B', 'Routed B'],
    ...battles.map((b) => [
      b.played_at ? new Date(b.played_at).toLocaleDateString('en-GB') : '',
      warbandAll[b.warband_a_id] ?? b.warband_a_id, b.result_a ?? '', b.wyrdstone_a, b.warband_a_routed ? 'Yes' : 'No',
      warbandAll[b.warband_b_id] ?? b.warband_b_id, b.result_b ?? '', b.wyrdstone_b, b.warband_b_routed ? 'Yes' : 'No',
    ]),
  ])

  // ── territories.csv ──────────────────────────────────────────────────────────
  const territoriesCsv = csv([
    ['Warband', 'Territory', 'Income Bonus', 'Acquired', 'Via'],
    ...territories.map((t) => [
      t.warbands?.name ?? t.warband_id,
      t.territories?.name ?? '',
      t.territories?.income_bonus ?? 0,
      t.acquired_at ? new Date(t.acquired_at).toLocaleDateString('en-GB') : '',
      t.acquired_via ?? '',
    ]),
  ])

  // ── Build ZIP ─────────────────────────────────────────────────────────────────
  const zip = new JSZip()
  const folderName = campaign.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const folder = zip.folder(folderName)!

  folder.file('warbands.csv', warbandsCsv)
  folder.file('warriors.csv', warriorsCsv)
  folder.file('battles.csv', battlesCsv)
  folder.file('territories.csv', territoriesCsv)
  folder.file('README.txt', [
    `Mordheim Manager — Campaign Export`,
    `Campaign: ${campaign.name}`,
    `Exported: ${new Date().toISOString()}`,
    ``,
    `Files:`,
    `  warbands.csv   — Standings with all warband statistics`,
    `  warriors.csv   — All warriors with stats, XP, and skills`,
    `  battles.csv    — All confirmed battle results`,
    `  territories.csv — Territory holdings`,
  ].join('\n'))

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
  const filename = `${folderName}-export.zip`

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
