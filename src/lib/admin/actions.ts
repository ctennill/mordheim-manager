'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return supabase
}

function parseArr(raw: FormDataEntryValue | null): string[] {
  if (!raw) return []
  try { return JSON.parse(raw as string) as string[] } catch { return [] }
}

function parseNum(raw: FormDataEntryValue | null, fallback = 0): number {
  const n = parseInt(raw as string, 10)
  return isNaN(n) ? fallback : n
}

function parseNullableNum(raw: FormDataEntryValue | null): number | null {
  if (!raw || (raw as string).trim() === '') return null
  const n = parseInt(raw as string, 10)
  return isNaN(n) ? null : n
}

// ─── Factions ────────────────────────────────────────────────────────────────

export async function createFaction(_: unknown, formData: FormData) {
  const supabase = await requireAuth()
  const { error } = await supabase.from('factions').insert({
    name: (formData.get('name') as string).trim(),
    type: (formData.get('type') as string) as 'official' | 'supplement' | 'custom',
    ruleset: (formData.get('ruleset') as string) || 'core',
    alignment: (formData.get('alignment') as string) || null,
    lore: (formData.get('lore') as string) || null,
    special_rules: parseArr(formData.get('special_rules')),
    starting_gold: parseNum(formData.get('starting_gold'), 500),
    min_warband_size: parseNum(formData.get('min_warband_size'), 3),
    max_warband_size: parseNum(formData.get('max_warband_size'), 15),
    is_enabled: formData.get('is_enabled') === 'true',
  } as never)
  if (error) return { error: error.message }
  revalidatePath('/admin/factions')
  revalidatePath('/factions')
  redirect('/admin/factions')
}

export async function updateFaction(id: string, _: unknown, formData: FormData) {
  const supabase = await requireAuth()
  const { error } = await supabase.from('factions').update({
    name: (formData.get('name') as string).trim(),
    type: (formData.get('type') as string) as 'official' | 'supplement' | 'custom',
    ruleset: (formData.get('ruleset') as string) || 'core',
    alignment: (formData.get('alignment') as string) || null,
    lore: (formData.get('lore') as string) || null,
    special_rules: parseArr(formData.get('special_rules')),
    starting_gold: parseNum(formData.get('starting_gold'), 500),
    min_warband_size: parseNum(formData.get('min_warband_size'), 3),
    max_warband_size: parseNum(formData.get('max_warband_size'), 15),
    is_enabled: formData.get('is_enabled') === 'true',
  } as never).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/factions')
  revalidatePath(`/admin/factions/${id}`)
  revalidatePath('/factions')
  redirect(`/admin/factions/${id}`)
}

export async function deleteFaction(id: string) {
  const supabase = await requireAuth()
  await supabase.from('factions').delete().eq('id', id)
  revalidatePath('/admin/factions')
  revalidatePath('/factions')
  redirect('/admin/factions')
}

// ─── Faction Positions ───────────────────────────────────────────────────────

export async function createPosition(factionId: string, _: unknown, formData: FormData) {
  const supabase = await requireAuth()
  const { error } = await supabase.from('faction_positions').insert({
    faction_id: factionId,
    name: (formData.get('name') as string).trim(),
    warrior_type: formData.get('warrior_type') as 'hero' | 'henchman',
    is_leader: formData.get('is_leader') === 'true',
    min_count: parseNum(formData.get('min_count'), 0),
    max_count: parseNum(formData.get('max_count'), 1),
    move: parseNum(formData.get('move'), 4),
    weapon_skill: parseNum(formData.get('weapon_skill'), 3),
    ballistic_skill: parseNum(formData.get('ballistic_skill'), 3),
    strength: parseNum(formData.get('strength'), 3),
    toughness: parseNum(formData.get('toughness'), 3),
    wounds: parseNum(formData.get('wounds'), 1),
    initiative: parseNum(formData.get('initiative'), 3),
    attacks: parseNum(formData.get('attacks'), 1),
    leadership: parseNum(formData.get('leadership'), 7),
    primary_skills: parseArr(formData.get('primary_skills')),
    secondary_skills: parseArr(formData.get('secondary_skills')),
    special_rules: parseArr(formData.get('special_rules')),
    cost: parseNum(formData.get('cost'), 0),
    sort_order: parseNum(formData.get('sort_order'), 0),
  } as never)
  if (error) return { error: error.message }
  revalidatePath(`/admin/factions/${factionId}`)
  redirect(`/admin/factions/${factionId}`)
}

export async function updatePosition(factionId: string, posId: string, _: unknown, formData: FormData) {
  const supabase = await requireAuth()
  const { error } = await supabase.from('faction_positions').update({
    name: (formData.get('name') as string).trim(),
    warrior_type: formData.get('warrior_type') as 'hero' | 'henchman',
    is_leader: formData.get('is_leader') === 'true',
    min_count: parseNum(formData.get('min_count'), 0),
    max_count: parseNum(formData.get('max_count'), 1),
    move: parseNum(formData.get('move'), 4),
    weapon_skill: parseNum(formData.get('weapon_skill'), 3),
    ballistic_skill: parseNum(formData.get('ballistic_skill'), 3),
    strength: parseNum(formData.get('strength'), 3),
    toughness: parseNum(formData.get('toughness'), 3),
    wounds: parseNum(formData.get('wounds'), 1),
    initiative: parseNum(formData.get('initiative'), 3),
    attacks: parseNum(formData.get('attacks'), 1),
    leadership: parseNum(formData.get('leadership'), 7),
    primary_skills: parseArr(formData.get('primary_skills')),
    secondary_skills: parseArr(formData.get('secondary_skills')),
    special_rules: parseArr(formData.get('special_rules')),
    cost: parseNum(formData.get('cost'), 0),
    sort_order: parseNum(formData.get('sort_order'), 0),
  } as never).eq('id', posId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/factions/${factionId}`)
  revalidatePath(`/admin/factions/${factionId}/positions/${posId}`)
  redirect(`/admin/factions/${factionId}`)
}

export async function deletePosition(posId: string, factionId: string) {
  const supabase = await requireAuth()
  await supabase.from('faction_positions').delete().eq('id', posId)
  revalidatePath(`/admin/factions/${factionId}`)
  redirect(`/admin/factions/${factionId}`)
}

// ─── Equipment ───────────────────────────────────────────────────────────────

export async function createEquipment(_: unknown, formData: FormData) {
  const supabase = await requireAuth()
  const { error } = await supabase.from('equipment').insert({
    name: (formData.get('name') as string).trim(),
    category: formData.get('category') as string,
    cost: parseNum(formData.get('cost'), 0),
    mod_move: parseNullableNum(formData.get('mod_move')),
    mod_weapon_skill: parseNullableNum(formData.get('mod_weapon_skill')),
    mod_ballistic_skill: parseNullableNum(formData.get('mod_ballistic_skill')),
    mod_strength: parseNullableNum(formData.get('mod_strength')),
    mod_toughness: parseNullableNum(formData.get('mod_toughness')),
    mod_wounds: parseNullableNum(formData.get('mod_wounds')),
    mod_initiative: parseNullableNum(formData.get('mod_initiative')),
    mod_attacks: parseNullableNum(formData.get('mod_attacks')),
    mod_leadership: parseNullableNum(formData.get('mod_leadership')),
    special_rules: parseArr(formData.get('special_rules')),
    rarity: parseNum(formData.get('rarity'), 0),
    max_per_warrior: parseNum(formData.get('max_per_warrior'), 1),
    is_magic: formData.get('is_magic') === 'true',
    description: (formData.get('description') as string) || null,
  } as never)
  if (error) return { error: error.message }
  revalidatePath('/admin/equipment')
  redirect('/admin/equipment')
}

export async function updateEquipment(id: string, _: unknown, formData: FormData) {
  const supabase = await requireAuth()
  const { error } = await supabase.from('equipment').update({
    name: (formData.get('name') as string).trim(),
    category: formData.get('category') as string,
    cost: parseNum(formData.get('cost'), 0),
    mod_move: parseNullableNum(formData.get('mod_move')),
    mod_weapon_skill: parseNullableNum(formData.get('mod_weapon_skill')),
    mod_ballistic_skill: parseNullableNum(formData.get('mod_ballistic_skill')),
    mod_strength: parseNullableNum(formData.get('mod_strength')),
    mod_toughness: parseNullableNum(formData.get('mod_toughness')),
    mod_wounds: parseNullableNum(formData.get('mod_wounds')),
    mod_initiative: parseNullableNum(formData.get('mod_initiative')),
    mod_attacks: parseNullableNum(formData.get('mod_attacks')),
    mod_leadership: parseNullableNum(formData.get('mod_leadership')),
    special_rules: parseArr(formData.get('special_rules')),
    rarity: parseNum(formData.get('rarity'), 0),
    max_per_warrior: parseNum(formData.get('max_per_warrior'), 1),
    is_magic: formData.get('is_magic') === 'true',
    description: (formData.get('description') as string) || null,
  } as never).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/equipment')
  revalidatePath(`/admin/equipment/${id}`)
  redirect('/admin/equipment')
}

export async function deleteEquipment(id: string) {
  const supabase = await requireAuth()
  await supabase.from('equipment').delete().eq('id', id)
  revalidatePath('/admin/equipment')
  redirect('/admin/equipment')
}

// ─── Faction Equipment (join) ─────────────────────────────────────────────────

export async function setFactionEquipment(
  factionId: string,
  equipmentIds: string[],
  factionSpecificIds: string[]
) {
  const supabase = await requireAuth()
  await supabase.from('faction_equipment').delete().eq('faction_id', factionId)
  if (equipmentIds.length > 0) {
    const rows = equipmentIds.map(eid => ({
      faction_id: factionId,
      equipment_id: eid,
      is_faction_specific: factionSpecificIds.includes(eid),
    }))
    await supabase.from('faction_equipment').insert(rows as never)
  }
  revalidatePath(`/admin/factions/${factionId}`)
}
