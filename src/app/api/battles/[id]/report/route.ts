import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { BattleReportPdf } from '@/lib/pdf/battle-report'
import { type Battle, type Warband } from '@/types/database'
import React from 'react'

export const runtime = 'nodejs'

type WarriorResult = {
  warband_id: string
  warriors: { name: string | null; warrior_type: string } | null
  went_out_of_action: boolean
  injury_result: string | null
  xp_gained: number
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single() as { data: Battle | null }

  if (!battle) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!battle.result_a) return NextResponse.json({ error: 'Battle result not yet confirmed' }, { status: 409 })

  // Auth: must be a participant or campaign commissioner
  const { data: warbands } = await supabase
    .from('warbands')
    .select('id, name, owner_id')
    .in('id', [battle.warband_a_id, battle.warband_b_id]) as { data: Pick<Warband, 'id' | 'name' | 'owner_id'>[] | null }

  const isParticipant = (warbands ?? []).some((w) => w.owner_id === user.id)
  if (!isParticipant && battle.campaign_id) {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('commissioner_id')
      .eq('id', battle.campaign_id)
      .single() as { data: { commissioner_id: string } | null }
    if (!campaign || campaign.commissioner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } else if (!isParticipant) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const warbandA = (warbands ?? []).find((w) => w.id === battle.warband_a_id) ?? { id: battle.warband_a_id, name: 'Warband A', owner_id: '' }
  const warbandB = (warbands ?? []).find((w) => w.id === battle.warband_b_id) ?? { id: battle.warband_b_id, name: 'Warband B', owner_id: '' }

  // Fetch warrior results if they exist
  const { data: results } = await supabase
    .from('battle_warrior_results')
    .select('warband_id, warriors:warrior_id(name, warrior_type), went_out_of_action, injury_result, xp_gained')
    .eq('battle_id', battleId) as { data: WarriorResult[] | null }

  const warriorResults = (results ?? []).map((r) => ({
    warbandId: r.warband_id,
    warriorName: r.warriors?.name ?? 'Unknown',
    warriorType: r.warriors?.warrior_type ?? 'hero',
    wentOoa: r.went_out_of_action,
    injuryResult: r.injury_result,
    xpGained: r.xp_gained ?? 0,
  }))

  // Fetch scenario and campaign names
  let scenarioName: string | null = null
  let campaignName: string | null = null

  const [scenarioRes, campaignRes] = await Promise.all([
    battle.scenario_id
      ? supabase.from('scenarios').select('name').eq('id', battle.scenario_id).single()
      : Promise.resolve({ data: null }),
    battle.campaign_id
      ? supabase.from('campaigns').select('name').eq('id', battle.campaign_id).single()
      : Promise.resolve({ data: null }),
  ])

  scenarioName = (scenarioRes.data as { name: string } | null)?.name ?? null
  campaignName = (campaignRes.data as { name: string } | null)?.name ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await renderToStream(React.createElement(BattleReportPdf, { battle, warbandA, warbandB, scenarioName, campaignName, warriorResults }) as any)

  const slug = `battle-report-${battle.played_at ? new Date(battle.played_at).toISOString().slice(0, 10) : battleId.slice(0, 8)}`

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${slug}.pdf"`,
    },
  })
}
