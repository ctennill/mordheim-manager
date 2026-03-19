import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type WarbandTerritory, type Territory, type Warband } from '@/types/database'

// GET /api/campaigns/[id]/territories — all territory holdings in campaign
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params
  const supabase = await createClient()

  const { data: holdings } = await supabase
    .from('warband_territories')
    .select(`
      *,
      territories(*),
      warbands:warband_id(id, name, factions:faction_id(name))
    `)
    .eq('campaign_id', campaignId)
    .order('acquired_at') as {
      data: (WarbandTerritory & {
        territories: Territory
        warbands: Pick<Warband, 'id' | 'name'> & { factions: { name: string } | null }
      })[] | null
    }

  return NextResponse.json(holdings ?? [])
}
