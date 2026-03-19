import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { id: campaignId, pid } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only campaign commissioner may approve
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('commissioner_id')
    .eq('id', campaignId)
    .single() as { data: { commissioner_id: string } | null }

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  if (campaign.commissioner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('campaign_players')
    .update({ approval_status: 'approved' } as never)
    .eq('id', pid)
    .eq('campaign_id', campaignId)

  if (error) return NextResponse.json({ error: 'Failed to approve player' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
