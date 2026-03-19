import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Battle } from '@/types/database'

// POST /api/battles/[id]/result — submit battle result (one side)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { side, result, myRouted, opponentRouted, wyrdstoneShards, warriors } = await req.json()

  if (!['a', 'b'].includes(side) || !['win', 'loss', 'draw'].includes(result)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Verify battle exists and user owns the claimed side
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single() as { data: Battle | null }

  if (!battle) return NextResponse.json({ error: 'Battle not found' }, { status: 404 })

  const myWarbandId = side === 'a' ? battle.warband_a_id : battle.warband_b_id
  const { data: wb } = await supabase
    .from('warbands')
    .select('owner_id')
    .eq('id', myWarbandId)
    .single() as { data: { owner_id: string } | null }

  if (!wb || wb.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Determine opponent result
  const opponentResult = result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw'

  const updateFields = side === 'a'
    ? {
        result_a: result,
        result_b: opponentResult,
        warband_a_routed: myRouted,
        warband_b_routed: opponentRouted,
        wyrdstone_a: wyrdstoneShards,
        submitted_by: user.id,
      }
    : {
        result_b: result,
        result_a: opponentResult,
        warband_b_routed: myRouted,
        warband_a_routed: opponentRouted,
        wyrdstone_b: wyrdstoneShards,
        submitted_by: user.id,
      }

  const { error: updateErr } = await supabase
    .from('battles')
    .update(updateFields as never)
    .eq('id', battleId)

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to update battle' }, { status: 500 })
  }

  // Insert battle_warrior_results for this side's warriors
  if (Array.isArray(warriors) && warriors.length > 0) {
    const rows = warriors.flatMap((w: { id: string; outOfActionCount: number }) => {
      if (w.outOfActionCount === 0) return []
      return [{
        battle_id: battleId,
        warrior_id: w.id,
        warband_id: myWarbandId,
        went_out_of_action: true,
      }]
    })

    if (rows.length > 0) {
      await supabase.from('battle_warrior_results').upsert(rows as never, { onConflict: 'battle_id,warrior_id' })
    }
  }

  return NextResponse.json({ ok: true })
}
