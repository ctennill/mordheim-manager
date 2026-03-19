import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type FactionPosition } from '@/types/database'

interface EquipmentInput {
  id: string
  cost: number
  quantity: number
}

interface HeroInput {
  positionId: string
  name: string
  equipment: EquipmentInput[]
}

interface HenchmanInput {
  positionId: string
  count: number
  equipment: EquipmentInput[]
}

interface CreateWarbandBody {
  factionId: string
  name: string
  motto?: string
  status?: 'draft' | 'submitted'
  heroes: HeroInput[]
  henchmen: HenchmanInput[]
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CreateWarbandBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { factionId, name, motto, status = 'draft', heroes, henchmen } = body

  if (!factionId || !name?.trim()) {
    return NextResponse.json({ error: 'factionId and name are required' }, { status: 400 })
  }

  // Fetch all needed positions to get base stats
  const allPositionIds = [
    ...heroes.map((h) => h.positionId),
    ...henchmen.map((h) => h.positionId),
  ]

  const { data: positions, error: posErr } = await supabase
    .from('faction_positions')
    .select('*')
    .in('id', allPositionIds) as { data: FactionPosition[] | null; error: unknown }

  if (posErr || !positions) {
    return NextResponse.json({ error: 'Failed to load faction positions' }, { status: 500 })
  }

  const posMap = Object.fromEntries(positions.map((p) => [p.id, p]))

  // Calculate treasury = starting_gold - total spent
  const { data: faction } = await supabase
    .from('factions')
    .select('starting_gold')
    .eq('id', factionId)
    .single() as { data: { starting_gold: number } | null }

  const startingGold = faction?.starting_gold ?? 500

  const heroesCost = heroes.reduce((sum, h) => {
    const pos = posMap[h.positionId]
    const eqCost = h.equipment.reduce((s, e) => s + e.cost * e.quantity, 0)
    return sum + (pos?.cost ?? 0) + eqCost
  }, 0)

  const henchmenCost = henchmen.reduce((sum, h) => {
    const pos = posMap[h.positionId]
    const eqCost = h.equipment.reduce((s, e) => s + e.cost * e.quantity, 0)
    return sum + h.count * (pos?.cost ?? 0) + eqCost
  }, 0)

  const treasury = startingGold - heroesCost - henchmenCost
  const totalModels = heroes.length + henchmen.reduce((s, h) => s + h.count, 0)
  const warbandRating = totalModels * 5 + Math.floor(Math.max(0, treasury) / 5)

  // ── Insert warband ────────────────────────────────────────────────────────
  const { data: warband, error: warbandErr } = await supabase
    .from('warbands')
    .insert({
      owner_id: user.id,
      faction_id: factionId,
      name: name.trim(),
      motto: motto?.trim() || null,
      status,
      treasury: Math.max(0, treasury),
      warband_rating: warbandRating,
    } as never)
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (warbandErr || !warband) {
    console.error('Warband insert error:', warbandErr)
    return NextResponse.json({ error: 'Failed to create warband' }, { status: 500 })
  }

  const warbandId = warband.id

  // ── Insert warriors ───────────────────────────────────────────────────────
  const warriorInserts = [
    ...heroes.map((h) => {
      const pos = posMap[h.positionId]
      if (!pos) return null
      return {
        warband_id: warbandId,
        faction_position_id: h.positionId,
        name: h.name?.trim() || null,
        warrior_type: 'hero' as const,
        status: 'active' as const,
        group_count: 1,
        experience: 0,
        advancements_taken: 0,
        move: pos.move, weapon_skill: pos.weapon_skill, ballistic_skill: pos.ballistic_skill,
        strength: pos.strength, toughness: pos.toughness, wounds: pos.wounds,
        initiative: pos.initiative, attacks: pos.attacks, leadership: pos.leadership,
        base_move: pos.move, base_weapon_skill: pos.weapon_skill, base_ballistic_skill: pos.ballistic_skill,
        base_strength: pos.strength, base_toughness: pos.toughness, base_wounds: pos.wounds,
        base_initiative: pos.initiative, base_attacks: pos.attacks, base_leadership: pos.leadership,
        skills: pos.special_rules,
        special_rules: pos.special_rules,
      }
    }),
    ...henchmen.map((h) => {
      const pos = posMap[h.positionId]
      if (!pos) return null
      return {
        warband_id: warbandId,
        faction_position_id: h.positionId,
        name: null,
        warrior_type: 'henchman' as const,
        status: 'active' as const,
        group_count: h.count,
        experience: 0,
        advancements_taken: 0,
        move: pos.move, weapon_skill: pos.weapon_skill, ballistic_skill: pos.ballistic_skill,
        strength: pos.strength, toughness: pos.toughness, wounds: pos.wounds,
        initiative: pos.initiative, attacks: pos.attacks, leadership: pos.leadership,
        base_move: pos.move, base_weapon_skill: pos.weapon_skill, base_ballistic_skill: pos.ballistic_skill,
        base_strength: pos.strength, base_toughness: pos.toughness, base_wounds: pos.wounds,
        base_initiative: pos.initiative, base_attacks: pos.attacks, base_leadership: pos.leadership,
        skills: [],
        special_rules: pos.special_rules,
      }
    }),
  ].filter(Boolean)

  const { data: insertedWarriors, error: warriorErr } = await supabase
    .from('warriors')
    .insert(warriorInserts as never[])
    .select('id, faction_position_id, warrior_type, group_count') as {
      data: Array<{ id: string; faction_position_id: string; warrior_type: string; group_count: number }> | null
      error: unknown
    }

  if (warriorErr || !insertedWarriors) {
    console.error('Warrior insert error:', warriorErr)
    // Roll back warband
    await supabase.from('warbands').delete().eq('id', warbandId)
    return NextResponse.json({ error: 'Failed to create warriors' }, { status: 500 })
  }

  // ── Insert warrior equipment ──────────────────────────────────────────────
  const equipmentInserts: Array<{
    warrior_id: string
    equipment_id: string
    quantity: number
    cost_paid: number
  }> = []

  // Match inserted warriors back to their input by position + order
  let heroIdx = 0
  let henchmanIdx = 0

  for (const warrior of insertedWarriors) {
    if (warrior.warrior_type === 'hero') {
      const input = heroes[heroIdx++]
      if (input) {
        for (const eq of input.equipment) {
          if (eq.quantity > 0) {
            equipmentInserts.push({
              warrior_id: warrior.id,
              equipment_id: eq.id,
              quantity: eq.quantity,
              cost_paid: eq.cost * eq.quantity,
            })
          }
        }
      }
    } else {
      const input = henchmen[henchmanIdx++]
      if (input) {
        for (const eq of input.equipment) {
          if (eq.quantity > 0) {
            equipmentInserts.push({
              warrior_id: warrior.id,
              equipment_id: eq.id,
              quantity: eq.quantity,
              cost_paid: eq.cost * eq.quantity,
            })
          }
        }
      }
    }
  }

  if (equipmentInserts.length > 0) {
    const { error: eqErr } = await supabase.from('warrior_equipment').insert(equipmentInserts as never[])
    if (eqErr) {
      console.error('Equipment insert error:', eqErr)
      // Non-fatal — warband still created, equipment can be added later
    }
  }

  return NextResponse.json({ warbandId }, { status: 201 })
}
