// scripts/seed-faction-positions.mjs
// Seeds faction_positions for the 6 factions missing from migration 003.
// Run with: node scripts/seed-faction-positions.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://heuuoesntfcascwvpiqo.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldXVvZXNudGZjYXNjd3ZwaXFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg5MDcwMSwiZXhwIjoyMDg5NDY2NzAxfQ.QR82kRfGwCJ3IiYP_bbozyFVz83o41fYeJftPUu0k0U'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
})

// Positions keyed by faction name
const POSITIONS = {
  'Marienburg Merchants': [
    { name: 'Merchant', warrior_type: 'hero', is_leader: true, min_count: 1, max_count: 1, move: 4, weapon_skill: 4, ballistic_skill: 4, strength: 3, toughness: 3, wounds: 1, initiative: 4, attacks: 1, leadership: 8, primary_skills: ['Combat','Shooting','Academic','Speed'], secondary_skills: [], special_rules: [], cost: 60, sort_order: 1 },
    { name: "Merchant's Bodyguard", warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 2, move: 4, weapon_skill: 4, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: ['Combat','Shooting','Speed'], secondary_skills: ['Academic'], special_rules: [], cost: 35, sort_order: 2 },
    { name: "Merchant's Apprentice", warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 2, move: 4, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 6, primary_skills: ['Combat','Academic'], secondary_skills: ['Shooting','Speed'], special_rules: [], cost: 25, sort_order: 3 },
    { name: 'Swordsmen', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 5, move: 4, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: [], secondary_skills: [], special_rules: [], cost: 25, sort_order: 4 },
    { name: 'Marksmen', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 5, move: 4, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: [], secondary_skills: [], special_rules: [], cost: 25, sort_order: 5 },
    { name: 'Dregs', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 3, move: 4, weapon_skill: 2, ballistic_skill: 2, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 5, primary_skills: [], secondary_skills: [], special_rules: [], cost: 15, sort_order: 6 },
  ],
  'Middenheim Mercenaries': [
    { name: 'Champion of Ulric', warrior_type: 'hero', is_leader: true, min_count: 1, max_count: 1, move: 4, weapon_skill: 4, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 4, attacks: 1, leadership: 8, primary_skills: ['Combat','Shooting','Speed'], secondary_skills: ['Academic'], special_rules: [], cost: 50, sort_order: 1 },
    { name: 'Warrior of Ulric', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 2, move: 4, weapon_skill: 4, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: ['Combat','Speed'], secondary_skills: ['Shooting'], special_rules: [], cost: 35, sort_order: 2 },
    { name: 'Youngblood', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 2, move: 4, weapon_skill: 2, ballistic_skill: 2, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 6, primary_skills: ['Combat','Speed'], secondary_skills: ['Shooting','Academic'], special_rules: [], cost: 15, sort_order: 3 },
    { name: 'Ulricans', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 5, move: 4, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: [], secondary_skills: [], special_rules: [], cost: 25, sort_order: 4 },
    { name: 'Wolves', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 3, move: 9, weapon_skill: 4, ballistic_skill: 0, strength: 3, toughness: 3, wounds: 1, initiative: 4, attacks: 1, leadership: 5, primary_skills: [], secondary_skills: [], special_rules: ['Animal','Cause Fear'], cost: 25, sort_order: 5 },
  ],
  'Witch Hunters': [
    { name: 'Witch Hunter Captain', warrior_type: 'hero', is_leader: true, min_count: 1, max_count: 1, move: 4, weapon_skill: 4, ballistic_skill: 4, strength: 3, toughness: 3, wounds: 1, initiative: 4, attacks: 1, leadership: 8, primary_skills: ['Combat','Shooting','Academic','Speed'], secondary_skills: [], special_rules: [], cost: 60, sort_order: 1 },
    { name: 'Witch Hunter', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 3, move: 4, weapon_skill: 4, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: ['Combat','Shooting'], secondary_skills: ['Academic','Speed'], special_rules: [], cost: 35, sort_order: 2 },
    { name: 'Warrior Priest', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 1, move: 4, weapon_skill: 4, ballistic_skill: 3, strength: 4, toughness: 4, wounds: 1, initiative: 3, attacks: 1, leadership: 8, primary_skills: ['Combat','Academic'], secondary_skills: ['Speed'], special_rules: ['Prayers of Sigmar'], cost: 45, sort_order: 3 },
    { name: 'Flagellant', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 1, move: 4, weapon_skill: 4, ballistic_skill: 0, strength: 3, toughness: 3, wounds: 1, initiative: 2, attacks: 2, leadership: 10, primary_skills: ['Combat'], secondary_skills: [], special_rules: ['Frenzy','Immune to Psychology','Flagellant'], cost: 30, sort_order: 4 },
    { name: 'Zealots', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 5, move: 4, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: [], secondary_skills: [], special_rules: [], cost: 25, sort_order: 5 },
    { name: 'Flagellants', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 5, move: 4, weapon_skill: 3, ballistic_skill: 0, strength: 3, toughness: 3, wounds: 1, initiative: 2, attacks: 1, leadership: 10, primary_skills: [], secondary_skills: [], special_rules: ['Frenzy','Immune to Psychology','Flagellant'], cost: 30, sort_order: 6 },
  ],
  'Orcs & Goblins': [
    { name: 'Orc Boss', warrior_type: 'hero', is_leader: true, min_count: 1, max_count: 1, move: 4, weapon_skill: 4, ballistic_skill: 3, strength: 4, toughness: 4, wounds: 1, initiative: 3, attacks: 1, leadership: 8, primary_skills: ['Combat','Speed'], secondary_skills: ['Shooting'], special_rules: [], cost: 50, sort_order: 1 },
    { name: 'Orc Shaman', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 1, move: 4, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 4, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: ['Academic','Combat'], secondary_skills: ['Speed'], special_rules: ["Waaagh! Magic"], cost: 45, sort_order: 2 },
    { name: "Orc Big 'Un", warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 2, move: 4, weapon_skill: 4, ballistic_skill: 2, strength: 4, toughness: 4, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: ['Combat','Speed'], secondary_skills: [], special_rules: [], cost: 35, sort_order: 3 },
    { name: 'Goblin', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 2, move: 4, weapon_skill: 2, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 6, primary_skills: ['Speed'], secondary_skills: ['Combat','Shooting'], special_rules: [], cost: 15, sort_order: 4 },
    { name: 'Orc Boys', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 7, move: 4, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 4, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: [], secondary_skills: [], special_rules: [], cost: 25, sort_order: 5 },
    { name: 'Night Goblins', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 7, move: 4, weapon_skill: 2, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 2, attacks: 1, leadership: 6, primary_skills: [], secondary_skills: [], special_rules: ['Animosity'], cost: 15, sort_order: 6 },
    { name: 'Troll', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 1, move: 4, weapon_skill: 3, ballistic_skill: 1, strength: 5, toughness: 4, wounds: 3, initiative: 1, attacks: 3, leadership: 4, primary_skills: [], secondary_skills: [], special_rules: ['Cause Fear','Regenerate','Stupid'], cost: 70, sort_order: 7 },
  ],
  'Cult of the Possessed': [
    { name: 'Magister', warrior_type: 'hero', is_leader: true, min_count: 1, max_count: 1, move: 4, weapon_skill: 4, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 8, primary_skills: ['Combat','Academic','Speed'], secondary_skills: [], special_rules: ['Chaos Rituals'], cost: 60, sort_order: 1 },
    { name: 'Possessed', warrior_type: 'hero', is_leader: false, min_count: 1, max_count: 2, move: 4, weapon_skill: 4, ballistic_skill: 0, strength: 4, toughness: 4, wounds: 1, initiative: 3, attacks: 2, leadership: 7, primary_skills: ['Combat'], secondary_skills: ['Speed'], special_rules: ['Cause Fear','Mutation'], cost: 50, sort_order: 2 },
    { name: 'Mutant', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 2, move: 4, weapon_skill: 3, ballistic_skill: 2, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: ['Combat','Speed'], secondary_skills: ['Academic'], special_rules: ['Mutation'], cost: 30, sort_order: 3 },
    { name: 'Brethren', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 5, move: 4, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: [], secondary_skills: [], special_rules: [], cost: 25, sort_order: 4 },
    { name: 'Darksouls', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 5, move: 4, weapon_skill: 2, ballistic_skill: 2, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 6, primary_skills: [], secondary_skills: [], special_rules: [], cost: 15, sort_order: 5 },
  ],
  'Beastmen Raiders': [
    { name: 'Beastman Shaman', warrior_type: 'hero', is_leader: true, min_count: 1, max_count: 1, move: 5, weapon_skill: 4, ballistic_skill: 3, strength: 4, toughness: 4, wounds: 1, initiative: 4, attacks: 1, leadership: 8, primary_skills: ['Combat','Academic','Speed'], secondary_skills: [], special_rules: ['Beast Magic','Cause Fear'], cost: 70, sort_order: 1 },
    { name: 'Bestigor', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 2, move: 5, weapon_skill: 4, ballistic_skill: 3, strength: 4, toughness: 4, wounds: 1, initiative: 3, attacks: 1, leadership: 7, primary_skills: ['Combat','Speed'], secondary_skills: [], special_rules: ['Cause Fear','Scaly Skin'], cost: 55, sort_order: 2 },
    { name: 'Ungor', warrior_type: 'hero', is_leader: false, min_count: 0, max_count: 2, move: 5, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 6, primary_skills: ['Speed','Combat'], secondary_skills: ['Shooting'], special_rules: [], cost: 25, sort_order: 3 },
    { name: 'Gors', warrior_type: 'henchman', is_leader: false, min_count: 3, max_count: 7, move: 5, weapon_skill: 3, ballistic_skill: 3, strength: 4, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 6, primary_skills: [], secondary_skills: [], special_rules: ['Cause Fear'], cost: 30, sort_order: 4 },
    { name: 'Ungors', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 5, move: 5, weapon_skill: 3, ballistic_skill: 3, strength: 3, toughness: 3, wounds: 1, initiative: 3, attacks: 1, leadership: 5, primary_skills: [], secondary_skills: [], special_rules: [], cost: 20, sort_order: 5 },
    { name: 'Chaos Warhound', warrior_type: 'henchman', is_leader: false, min_count: 0, max_count: 3, move: 6, weapon_skill: 3, ballistic_skill: 0, strength: 4, toughness: 3, wounds: 1, initiative: 4, attacks: 1, leadership: 5, primary_skills: [], secondary_skills: [], special_rules: ['Animal','Cause Fear'], cost: 25, sort_order: 6 },
  ],
}

async function run() {
  // Fetch all 6 faction IDs in one query
  const { data: factions, error: fErr } = await supabase
    .from('factions')
    .select('id, name')
    .in('name', Object.keys(POSITIONS))

  if (fErr) { console.error('Failed to fetch factions:', fErr); process.exit(1) }
  if (!factions?.length) { console.error('No factions found — check that migration 003 has been run.'); process.exit(1) }

  const factionMap = Object.fromEntries(factions.map(f => [f.name, f.id]))

  // Check for existing positions to avoid duplicates
  const { data: existing } = await supabase
    .from('faction_positions')
    .select('faction_id')
    .in('faction_id', Object.values(factionMap))

  const alreadySeeded = new Set((existing ?? []).map(r => r.faction_id))

  let inserted = 0
  let skipped = 0

  for (const [factionName, positions] of Object.entries(POSITIONS)) {
    const factionId = factionMap[factionName]
    if (!factionId) { console.warn(`Faction not found in DB: ${factionName}`); continue }

    if (alreadySeeded.has(factionId)) {
      console.log(`  SKIP  ${factionName} (already has positions)`)
      skipped++
      continue
    }

    const rows = positions.map(p => ({ ...p, faction_id: factionId }))
    const { error } = await supabase.from('faction_positions').insert(rows)
    if (error) {
      console.error(`  ERROR ${factionName}:`, error.message)
    } else {
      console.log(`  OK    ${factionName} — ${rows.length} positions inserted`)
      inserted++
    }
  }

  console.log(`\nDone. ${inserted} factions seeded, ${skipped} already had data.`)
}

run()
