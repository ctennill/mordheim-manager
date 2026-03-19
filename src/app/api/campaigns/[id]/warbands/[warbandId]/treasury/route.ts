import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Warband } from '@/types/database'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; warbandId: string }> }
) {
  const { id: campaignId, warbandId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only commissioner
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('commissioner_id')
    .eq('id', campaignId)
    .single() as { data: { commissioner_id: string } | null }

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  if (campaign.commissioner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { amount } = await req.json() as { amount: number; notes?: string }
  if (typeof amount !== 'number') {
    return NextResponse.json({ error: 'amount must be a number' }, { status: 400 })
  }

  // Fetch current treasury
  const { data: warband } = await supabase
    .from('warbands')
    .select('treasury')
    .eq('id', warbandId)
    .single() as { data: Pick<Warband, 'treasury'> | null }

  if (!warband) return NextResponse.json({ error: 'Warband not found' }, { status: 404 })

  const newTreasury = Math.max(0, warband.treasury + amount)

  const { error } = await supabase
    .from('warbands')
    .update({ treasury: newTreasury } as never)
    .eq('id', warbandId)

  if (error) return NextResponse.json({ error: 'Failed to update treasury' }, { status: 500 })

  return NextResponse.json({ treasury: newTreasury })
}
