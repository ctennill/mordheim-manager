import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/lib/supabase/server"
import { type Campaign } from '@/types/database'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { warbandId } = await req.json()
  if (!warbandId) return NextResponse.json({ error: 'warbandId is required' }, { status: 400 })

  // Verify campaign exists and is open for registration
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, status, max_warbands, privacy, commissioner_id')
    .eq('id', campaignId)
    .single() as { data: Pick<Campaign, 'id' | 'status' | 'max_warbands' | 'privacy' | 'commissioner_id'> | null }

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  if (campaign.status !== 'registration' && campaign.status !== 'draft') {
    return NextResponse.json({ error: 'Campaign is not accepting registrations' }, { status: 409 })
  }

  // Check player count
  const { count } = await supabase
    .from('campaign_players')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('approval_status', 'approved')

  if (count !== null && campaign.max_warbands !== null && count >= campaign.max_warbands) {
    return NextResponse.json({ error: 'Campaign is full' }, { status: 409 })
  }

  // Commissioner joins as approved; public campaigns are approved; private/unlisted are pending
  const isCommissioner = campaign.commissioner_id === user.id
  const approvalStatus = isCommissioner || campaign.privacy === 'public' ? 'approved' : 'pending'

  const { error } = await supabase
    .from('campaign_players')
    .insert({
      campaign_id: campaignId,
      player_id: user.id,
      warband_id: warbandId,
      is_commissioner: isCommissioner,
      approval_status: approvalStatus,
    } as never)

  if (error) {
    const pg = error as { code?: string }
    if (pg.code === '23505') return NextResponse.json({ error: 'Already in this campaign' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to join campaign' }, { status: 500 })
  }

  return NextResponse.json({ approvalStatus }, { status: 201 })
}
