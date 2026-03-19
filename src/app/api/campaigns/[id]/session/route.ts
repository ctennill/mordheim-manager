import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Campaign } from '@/types/database'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('commissioner_id, current_session')
    .eq('id', campaignId)
    .single() as { data: Pick<Campaign, 'commissioner_id' | 'current_session'> | null }

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  if (campaign.commissioner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const newSession = campaign.current_session + 1

  const { error } = await supabase
    .from('campaigns')
    .update({ current_session: newSession } as never)
    .eq('id', campaignId)

  if (error) return NextResponse.json({ error: 'Failed to advance session' }, { status: 500 })

  return NextResponse.json({ current_session: newSession })
}
