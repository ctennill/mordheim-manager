import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Campaign } from '@/types/database'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only commissioner can update
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('commissioner_id')
    .eq('id', campaignId)
    .single() as { data: { commissioner_id: string } | null }

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  if (campaign.commissioner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    name?: string
    description?: string
    location?: string
    points_win?: number
    points_draw?: number
    points_loss?: number
    status?: Campaign['status']
    max_warbands?: number
    total_sessions?: number | null
  }

  const update: Record<string, unknown> = {}
  if (body.name !== undefined) update.name = body.name
  if (body.description !== undefined) update.description = body.description
  if (body.location !== undefined) update.location = body.location
  if (body.points_win !== undefined) update.points_win = body.points_win
  if (body.points_draw !== undefined) update.points_draw = body.points_draw
  if (body.points_loss !== undefined) update.points_loss = body.points_loss
  if (body.status !== undefined) update.status = body.status
  if (body.max_warbands !== undefined) update.max_warbands = body.max_warbands
  if (body.total_sessions !== undefined) update.total_sessions = body.total_sessions

  const { data: updated, error } = await supabase
    .from('campaigns')
    .update(update as never)
    .eq('id', campaignId)
    .select()
    .single() as { data: Campaign | null; error: unknown }

  if (error) return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })

  return NextResponse.json(updated)
}
