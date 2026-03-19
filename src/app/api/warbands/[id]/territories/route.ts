import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type WarbandTerritory, type Territory, type Warband } from '@/types/database'

// GET /api/warbands/[id]/territories
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: warbandId } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('warband_territories')
    .select('*, territories(*)')
    .eq('warband_id', warbandId)
    .order('acquired_at') as {
      data: (WarbandTerritory & { territories: Territory })[] | null
    }

  const result = (data ?? []).map(({ territories, ...holding }) => ({
    ...territories,
    income_formula: territories.income_formula ?? 'none',
    holding,
  }))

  return NextResponse.json(result)
}

// POST /api/warbands/[id]/territories — award territory (commissioner or exploration)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: warbandId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { territoryId, campaignId, acquiredVia } = await req.json()
  if (!territoryId) return NextResponse.json({ error: 'territoryId required' }, { status: 400 })

  // Verify caller is the warband owner OR the campaign commissioner
  const { data: warband } = await supabase
    .from('warbands')
    .select('owner_id, campaign_id')
    .eq('id', warbandId)
    .single() as { data: Pick<Warband, 'owner_id' | 'campaign_id'> | null }

  if (!warband) return NextResponse.json({ error: 'Warband not found' }, { status: 404 })

  const effectiveCampaignId = campaignId ?? warband.campaign_id
  let isCommissioner = false
  if (effectiveCampaignId) {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('commissioner_id')
      .eq('id', effectiveCampaignId)
      .single() as { data: { commissioner_id: string } | null }
    isCommissioner = campaign?.commissioner_id === user.id
  }

  const isOwner = warband.owner_id === user.id
  if (!isOwner && !isCommissioner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: holding, error } = await supabase
    .from('warband_territories')
    .insert({
      warband_id: warbandId,
      territory_id: territoryId,
      campaign_id: effectiveCampaignId,
      acquired_via: acquiredVia ?? 'commissioner',
    } as never)
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (error || !holding) {
    return NextResponse.json({ error: 'Failed to award territory' }, { status: 500 })
  }

  return NextResponse.json({ id: holding.id }, { status: 201 })
}
