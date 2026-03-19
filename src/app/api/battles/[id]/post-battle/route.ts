import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Battle, type Warband, type Warrior } from '@/types/database'

interface InjuryInput {
  warriorId: string
  d66Roll: string | null
  injuryName: string | null
  effectType: string | null
  effectDescription: string | null
  statMod: Record<string, number> | null
  goldLoss: number
  subRolls: {
    d66: string; name: string; effect: string
    statMod: Record<string, number> | null
  }[]
}

interface XpGainInput {
  warriorId: string
  xpGained: number
}

interface AdvancementInput {
  warriorId: string
  advanceIndex: number
  roll2d6: number | null
  chosenStat: string | null
  chosenSkill: string | null
}

// POST /api/battles/[id]/post-battle — atomically apply post-battle results
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    warbandId, side,
    injuries, xpGains, advancements,
    incomeTotal, explorationGold, goldSpent, spendNotes,
  } = await req.json()

  // Verify battle and ownership
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single() as { data: Battle | null }

  if (!battle) return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
  if (!battle.confirmed_by && !battle.commissioner_override) {
    return NextResponse.json({ error: 'Battle result not yet confirmed' }, { status: 409 })
  }

  // Check the post-battle hasn't already been submitted for this side
  const alreadyDone = side === 'a' ? battle.post_battle_complete_a : battle.post_battle_complete_b
  if (alreadyDone) {
    return NextResponse.json({ error: 'Post-battle already submitted for this warband' }, { status: 409 })
  }

  // Verify user owns this warband
  const { data: warband } = await supabase
    .from('warbands')
    .select('*')
    .eq('id', warbandId)
    .single() as { data: Warband | null }

  if (!warband || warband.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Collect stat delta totals across all injuries
  const statDeltas: Record<string, number> = {}
  const deadWarriorIds: string[] = []
  const capturedWarriorIds: string[] = []
  const missBattleWarriorIds: string[] = []

  function applyEffects(
    warriorId: string,
    effect: string | null,
    statMod: Record<string, number> | null,
    subRolls: InjuryInput['subRolls']
  ) {
    const allEffects = [{ effect, statMod }]
    for (const sr of subRolls) allEffects.push({ effect: sr.effect, statMod: sr.statMod })

    for (const { effect: e, statMod: sm } of allEffects) {
      if (e === 'dead') { deadWarriorIds.push(warriorId); return }
      if (e === 'captured') capturedWarriorIds.push(warriorId)
      if (e === 'miss_next_battle') missBattleWarriorIds.push(warriorId)
      if (e === 'stat_modifier' && sm) {
        for (const [stat, mod] of Object.entries(sm)) {
          statDeltas[`${warriorId}:${stat}`] = (statDeltas[`${warriorId}:${stat}`] ?? 0) + (mod as number)
        }
      }
    }
  }

  for (const inj of (injuries as InjuryInput[])) {
    applyEffects(inj.warriorId, inj.effectType, inj.statMod, inj.subRolls)
  }

  // ── Apply all DB changes ──────────────────────────────────────────────────

  const errors: string[] = []

  // 1. Mark dead warriors
  if (deadWarriorIds.length > 0) {
    const { error } = await supabase
      .from('warriors')
      .update({ status: 'dead' } as never)
      .in('id', deadWarriorIds)
    if (error) errors.push('Failed to mark dead warriors')
  }

  // 2. Mark captured warriors
  if (capturedWarriorIds.length > 0) {
    const { error } = await supabase
      .from('warriors')
      .update({ status: 'captured' } as never)
      .in('id', capturedWarriorIds)
    if (error) errors.push('Failed to mark captured warriors')
  }

  // 3. Mark miss-next-battle warriors
  if (missBattleWarriorIds.length > 0) {
    const { error } = await supabase
      .from('warriors')
      .update({ status: 'recovering' } as never)
      .in('id', missBattleWarriorIds)
    if (error) errors.push('Failed to mark recovering warriors')
  }

  // 4. Apply stat modifiers per warrior
  const warriorIdsWithStatMods = [...new Set(
    Object.keys(statDeltas).map((k) => k.split(':')[0])
  )]

  for (const warriorId of warriorIdsWithStatMods) {
    const { data: warrior } = await supabase
      .from('warriors')
      .select('*')
      .eq('id', warriorId)
      .single() as { data: Warrior | null }

    if (!warrior) continue

    const update: Record<string, number> = {}
    const stats = ['move','weapon_skill','ballistic_skill','strength','toughness','wounds','initiative','attacks','leadership']
    for (const stat of stats) {
      const delta = statDeltas[`${warriorId}:${stat}`]
      if (delta) {
        update[stat] = Math.max(1, (warrior[stat as keyof Warrior] as number) + delta)
      }
    }

    if (Object.keys(update).length > 0) {
      await supabase.from('warriors').update(update as never).eq('id', warriorId)
    }
  }

  // 5. Insert warrior_injuries records
  const injuryRows = (injuries as InjuryInput[])
    .filter((inj) => inj.d66Roll && inj.injuryName)
    .map((inj) => ({
      warrior_id: inj.warriorId,
      battle_id: battleId,
      injury_name: inj.injuryName!,
      d66_result: inj.d66Roll!,
      effect_type: inj.effectType ?? 'none',
      effect_description: inj.effectDescription ?? '',
      mod_move: inj.statMod?.move ?? null,
      mod_weapon_skill: inj.statMod?.weapon_skill ?? null,
      mod_ballistic_skill: inj.statMod?.ballistic_skill ?? null,
      mod_strength: inj.statMod?.strength ?? null,
      mod_toughness: inj.statMod?.toughness ?? null,
      mod_wounds: inj.statMod?.wounds ?? null,
      mod_initiative: inj.statMod?.initiative ?? null,
      mod_attacks: inj.statMod?.attacks ?? null,
      mod_leadership: inj.statMod?.leadership ?? null,
    }))

  if (injuryRows.length > 0) {
    await supabase.from('warrior_injuries').insert(injuryRows as never)
  }

  // 6. Apply XP gains + advancement tracking
  for (const xp of (xpGains as XpGainInput[])) {
    if (xp.xpGained <= 0) continue
    const { data: warrior } = await supabase
      .from('warriors')
      .select('experience')
      .eq('id', xp.warriorId)
      .single() as { data: { experience: number } | null }
    if (!warrior) continue
    await supabase
      .from('warriors')
      .update({ experience: warrior.experience + xp.xpGained } as never)
      .eq('id', xp.warriorId)
  }

  // 7. Insert warrior_advances + apply stat/skill changes
  for (const adv of (advancements as AdvancementInput[])) {
    if (!adv.roll2d6) continue

    // Insert advance record
    await supabase.from('warrior_advances').insert({
      warrior_id: adv.warriorId,
      battle_id: battleId,
      advance_number: adv.advanceIndex,
      roll_result: String(adv.roll2d6),
      advance_type: adv.chosenSkill ? 'skill' : adv.chosenStat ? 'stat' : 'stat',
      stat_increased: adv.chosenStat ?? null,
      stat_increase_amount: adv.chosenStat ? 1 : null,
      skill_gained: adv.chosenSkill ?? null,
    } as never)

    // Increment advancements_taken
    const { data: warrior } = await supabase
      .from('warriors')
      .select('advancements_taken, skills')
      .eq('id', adv.warriorId)
      .single() as { data: { advancements_taken: number; skills: string[] } | null }

    if (warrior) {
      const skillsUpdate = adv.chosenSkill
        ? { skills: [...warrior.skills, adv.chosenSkill] }
        : {}

      await supabase
        .from('warriors')
        .update({ advancements_taken: warrior.advancements_taken + 1, ...skillsUpdate } as never)
        .eq('id', adv.warriorId)

      // Apply stat increase
      if (adv.chosenStat) {
        const { data: fullWarrior } = await supabase
          .from('warriors')
          .select(adv.chosenStat)
          .eq('id', adv.warriorId)
          .single() as { data: Record<string, number> | null }
        if (fullWarrior) {
          await supabase
            .from('warriors')
            .update({ [adv.chosenStat]: fullWarrior[adv.chosenStat] + 1 } as never)
            .eq('id', adv.warriorId)
        }
      }
    }
  }

  // 8. Update warband treasury
  const goldDelta = incomeTotal + explorationGold - goldSpent
  const { data: currentWarband } = await supabase
    .from('warbands')
    .select('treasury')
    .eq('id', warbandId)
    .single() as { data: { treasury: number } | null }

  if (currentWarband) {
    await supabase
      .from('warbands')
      .update({ treasury: Math.max(0, currentWarband.treasury + goldDelta) } as never)
      .eq('id', warbandId)
  }

  // 9. Mark post-battle complete for this side
  const completionField = side === 'a' ? 'post_battle_complete_a' : 'post_battle_complete_b'
  await supabase
    .from('battles')
    .update({ [completionField]: true } as never)
    .eq('id', battleId)

  // 10. Mark battle_warrior_results as injuries_rolled
  const oaaIds = (injuries as InjuryInput[]).map((i) => i.warriorId)
  if (oaaIds.length > 0) {
    await supabase
      .from('battle_warrior_results')
      .update({ injuries_rolled: true } as never)
      .eq('battle_id', battleId)
      .in('warrior_id', oaaIds)
  }

  if (errors.length > 0) {
    console.error('Post-battle errors:', errors)
    return NextResponse.json({ ok: true, warnings: errors })
  }

  return NextResponse.json({ ok: true })
}
