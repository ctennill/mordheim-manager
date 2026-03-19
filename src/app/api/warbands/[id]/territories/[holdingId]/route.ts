import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type WarbandTerritory, type Warband } from '@/types/database'

// DELETE /api/warbands/[id]/territories/[holdingId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; holdingId: string }> }
) {
  const { id: warbandId, holdingId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch holding to get campaign_id
  const { data: holding } = await supabase
    .from('warband_territories')
    .select('campaign_id, warband_id')
    .eq('id', holdingId)
    .single() as { data: Pick<WarbandTerritory, 'campaign_id' | 'warband_id'> | null }

  if (!holding || holding.warband_id !== warbandId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Verify caller is commissioner
  if (holding.campaign_id) {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('commissioner_id')
      .eq('id', holding.campaign_id)
      .single() as { data: { commissioner_id: string } | null }

    if (campaign?.commissioner_id !== user.id) {
      // Also allow warband owner to remove
      const { data: warband } = await supabase
        .from('warbands')
        .select('owner_id')
        .eq('id', warbandId)
        .single() as { data: Pick<Warband, 'owner_id'> | null }
      if (warband?.owner_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  const { error } = await supabase
    .from('warband_territories')
    .delete()
    .eq('id', holdingId)

  if (error) return NextResponse.json({ error: 'Failed to remove territory' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
