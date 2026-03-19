import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Battle, type Warrior, type Warband, type Territory, type WarbandTerritory } from '@/types/database'

// GET /api/battles/[id]/post-battle-init
// Returns all data needed to initialise the post-battle Zustand store
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single() as { data: Battle | null }

  if (!battle) return NextResponse.json({ error: 'Battle not found' }, { status: 404 })

  // Find which side the user is
  const { data: warbands } = await supabase
    .from('warbands')
    .select('id, owner_id, treasury')
    .in('id', [battle.warband_a_id, battle.warband_b_id]) as {
      data: Pick<Warband, 'id' | 'owner_id' | 'treasury'>[] | null
    }

  const myWarband = (warbands ?? []).find((w) => w.owner_id === user.id)
  if (!myWarband) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const side: 'a' | 'b' = myWarband.id === battle.warband_a_id ? 'a' : 'b'
  const wyrdstoneShards = side === 'a' ? battle.wyrdstone_a : battle.wyrdstone_b
  const myRouted = side === 'a' ? battle.warband_a_routed : battle.warband_b_routed

  // Check already completed
  const alreadyDone = side === 'a' ? battle.post_battle_complete_a : battle.post_battle_complete_b
  if (alreadyDone) {
    return NextResponse.json({ error: 'Post-battle already completed for this warband' }, { status: 409 })
  }

  // Get OOA warriors from battle_warrior_results
  const { data: battleResults } = await supabase
    .from('battle_warrior_results')
    .select('warrior_id, went_out_of_action')
    .eq('battle_id', battleId)
    .eq('warband_id', myWarband.id) as { data: { warrior_id: string; went_out_of_action: boolean }[] | null }

  const oaaWarriorIds = (battleResults ?? [])
    .filter((r) => r.went_out_of_action)
    .map((r) => r.warrior_id)

  // Get all active warriors for this warband
  const { data: warriors } = await supabase
    .from('warriors')
    .select('id, name, warrior_type, status, experience, advancements_taken, group_count')
    .eq('warband_id', myWarband.id)
    .not('status', 'eq', 'dead') as {
      data: Pick<Warrior, 'id' | 'name' | 'warrior_type' | 'status' | 'experience' | 'advancements_taken' | 'group_count'>[] | null
    }

  const allWarriors = warriors ?? []
  const heroes = allWarriors.filter((w) => w.warrior_type === 'hero')

  // OOA warriors — only heroes get individual injury rolls (henchmen grouped)
  const oaaWarriors = allWarriors
    .filter((w) => oaaWarriorIds.includes(w.id) && w.warrior_type === 'hero')
    .map((w) => ({
      warriorId: w.id,
      warriorName: w.name ?? 'Hero',
      isHero: true,
    }))

  // Exploring heroes: survived (not OOA, not routed — per rules all heroes explore even if OOA)
  const exploringHeroes = heroes
    .filter((w) => w.status === 'active')
    .map((w) => ({
      warriorId: w.id,
      warriorName: w.name ?? 'Hero',
    }))

  // XP: battle result drives base XP
  // Survived +1, won +1 for leader (simplified: +1 all warriors that played)
  const myResult = side === 'a' ? battle.result_a : battle.result_b
  const baseXp = myRouted ? 0 : 1
  const winBonus = myResult === 'win' ? 1 : 0

  const xpEntries = allWarriors.map((w) => ({
    warriorId: w.id,
    warriorName: w.name ?? (w.warrior_type === 'hero' ? 'Hero' : 'Henchmen'),
    isHero: w.warrior_type === 'hero',
    currentXp: w.experience,
    xpGained: oaaWarriorIds.includes(w.id) ? 0 : baseXp + (w.warrior_type === 'hero' ? winBonus : 0),
    advancementsTaken: w.advancements_taken,
  }))

  // Fetch warband territories (with income formula)
  const { data: holdings } = await supabase
    .from('warband_territories')
    .select('id, territories(*)')
    .eq('warband_id', myWarband.id) as {
      data: (Pick<WarbandTerritory, 'id'> & { territories: Territory })[] | null
    }

  const territories = (holdings ?? [])
    .filter((h) => h.territories)
    .map((h) => ({
      id: h.id,
      name: h.territories.name,
      formula: h.territories.income_formula ?? 'none',
    }))

  return NextResponse.json({
    battleId,
    warbandId: myWarband.id,
    side,
    oaaWarriors,
    exploringHeroes,
    xpEntries,
    wyrdstoneShards,
    treasuryBefore: myWarband.treasury,
    territories,
  })
}
