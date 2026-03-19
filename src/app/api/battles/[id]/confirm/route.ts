import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Battle, type Warband } from '@/types/database'

// POST /api/battles/[id]/confirm — opponent confirms or disputes result
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json() // 'confirm' | 'dispute'
  if (!['confirm', 'dispute'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single() as { data: Battle | null }

  if (!battle) return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
  if (!battle.submitted_by) return NextResponse.json({ error: 'No result submitted yet' }, { status: 409 })
  if (battle.confirmed_by) return NextResponse.json({ error: 'Already confirmed' }, { status: 409 })

  // Verify user is the opponent (not the submitter)
  const { data: warbands } = await supabase
    .from('warbands')
    .select('id, owner_id')
    .in('id', [battle.warband_a_id, battle.warband_b_id]) as { data: Pick<Warband, 'id' | 'owner_id'>[] | null }

  const myWarband = (warbands ?? []).find((w) => w.owner_id === user.id)
  if (!myWarband) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (myWarband.id === (battle.submitted_by === user.id ? myWarband.id : null)) {
    return NextResponse.json({ error: 'Cannot confirm your own submission' }, { status: 403 })
  }

  if (action === 'dispute') {
    // Clear submission, flag for commissioner (simplified: just null out submitted_by)
    await supabase
      .from('battles')
      .update({ submitted_by: null, result_a: null, result_b: null } as never)
      .eq('id', battleId)
    return NextResponse.json({ ok: true, status: 'disputed' })
  }

  // Confirm: lock result, update warband records
  const { error } = await supabase
    .from('battles')
    .update({ confirmed_by: user.id } as never)
    .eq('id', battleId)

  if (error) return NextResponse.json({ error: 'Failed to confirm' }, { status: 500 })

  // Update warband win/loss/draw records
  const warbandA = (warbands ?? []).find((w) => w.id === battle.warband_a_id)
  const warbandB = (warbands ?? []).find((w) => w.id === battle.warband_b_id)

  async function updateRecord(warbandId: string, result: string) {
    const field = result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'draws'
    const { data: wb } = await supabase
      .from('warbands')
      .select('wins, losses, draws')
      .eq('id', warbandId)
      .single() as { data: Pick<Warband, 'wins' | 'losses' | 'draws'> | null }
    if (!wb) return
    await supabase
      .from('warbands')
      .update({ [field]: (wb[field as keyof typeof wb] as number) + 1 } as never)
      .eq('id', warbandId)
  }

  if (battle.result_a && warbandA) await updateRecord(warbandA.id, battle.result_a)
  if (battle.result_b && warbandB) await updateRecord(warbandB.id, battle.result_b)

  return NextResponse.json({ ok: true, status: 'confirmed' })
}
