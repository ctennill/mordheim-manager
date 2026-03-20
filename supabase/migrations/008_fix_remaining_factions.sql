-- Migration 008: Comprehensive faction data corrections
-- Sources: Official broheim.net PDFs fetched directly
--   Mercenaries.pdf  → Marienburg Merchants + Middenheim Mercenaries
--   Undead.pdf
--   Skaven.pdf (Clan Eshin)
--   Sisters of Sigmar.pdf
--   Witch Hunters.pdf
--   Orc Mob.pdf
--   Cult of the Possessed.pdf
--   Beastmen, Errata'd.pdf (unofficial errata; no official Beastmen PDF exists)
--
-- IMPORTANT: replaces the conservative 008 stub that only fixed Zombie/Warrior Priest.

-- ─────────────────────────────────────────────────────────────────────────────
-- MARIENBURG MERCHANTS
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_fid uuid;
begin
  select id into v_fid from factions where name = 'Marienburg Merchants';

  -- Faction special rules: official rule is +1 to rare-item rolls.
  -- "Rich" is already captured by starting_gold=600; "Hired Expertise" is invented.
  update factions set
    special_rules = ARRAY[
      'Merchant Contacts: +1 bonus when rolling to find rare items during trading'
    ]
  where id = v_fid;

  -- ── Heroes ──────────────────────────────────────────────────────────────────

  -- Rename "Merchant" → "Captain" (official position name)
  -- Stats already correct; add Strength to skill list
  update faction_positions set
    name           = 'Captain',
    primary_skills = ARRAY['Combat','Shooting','Academic','Strength','Speed']
  where faction_id = v_fid and name = 'Merchant';

  -- Rename "Merchant's Bodyguard" → "Champion"
  -- Official: Combat, Shooting, Speed (no Academic)
  update faction_positions set
    name              = 'Champion',
    primary_skills    = ARRAY['Combat','Shooting','Speed'],
    secondary_skills  = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Merchant''s Bodyguard';

  -- Rename "Merchant's Apprentice" → "Youngblood"
  -- Official: Combat, Shooting, Speed (not Combat/Academic)
  update faction_positions set
    name              = 'Youngblood',
    primary_skills    = ARRAY['Combat','Shooting','Speed'],
    secondary_skills  = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Merchant''s Apprentice';

  -- ── Henchmen ─────────────────────────────────────────────────────────────────

  -- Rename "Swordsmen" (WS3, 25gc) → "Warriors" (unlimited count)
  update faction_positions set
    name      = 'Warriors',
    max_count = 15
  where faction_id = v_fid and name = 'Swordsmen' and warrior_type = 'henchman';

  -- Marksmen: max count 5→7
  update faction_positions set max_count = 7
  where faction_id = v_fid and name = 'Marksmen';

  -- Delete Dregs — not a Marienburg unit; they belong to the Undead warband
  delete from faction_positions
  where faction_id = v_fid and name = 'Dregs';

  -- Add Swordsmen (WS4, 35gc, Expert Swordsmen — the proper elite henchman)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Swordsmen', 'henchman', false, 0, 5,
     4, 4, 3, 3, 3, 1, 3, 1, 7,
     ARRAY[]::text[], ARRAY[]::text[],
     ARRAY['Expert Swordsmen: may re-roll failed hits when charging (sword armed only)'],
     35, 7);
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- MIDDENHEIM MERCENARIES
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_fid uuid;
begin
  select id into v_fid from factions where name = 'Middenheim Mercenaries';

  -- Faction special rules: the only official rule is that Captain & Champions start S4.
  -- "Ulrican Fervour" and "Warriors of Ulric: +1S charging" are not in the PDF.
  update factions set
    special_rules = ARRAY[
      'Mighty Physique: the Captain and Champions start with Strength 4 instead of 3'
    ]
  where id = v_fid;

  -- ── Heroes ──────────────────────────────────────────────────────────────────

  -- Rename "Champion of Ulric" → "Captain"; apply S4 (official rule); fix cost & skills
  update faction_positions set
    name           = 'Captain',
    strength       = 4,
    cost           = 60,
    primary_skills = ARRAY['Combat','Shooting','Academic','Strength','Speed'],
    secondary_skills = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Champion of Ulric';

  -- Rename "Warrior of Ulric" → "Champion"; apply S4; fix skills
  -- Official: Combat, Strength, Speed (not Combat/Speed + Shooting secondary)
  update faction_positions set
    name              = 'Champion',
    strength          = 4,
    primary_skills    = ARRAY['Combat','Strength','Speed'],
    secondary_skills  = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Warrior of Ulric';

  -- Youngblood: fix skills to Combat, Strength, Speed (not Combat/Speed + Shooting/Academic)
  update faction_positions set
    primary_skills   = ARRAY['Combat','Strength','Speed'],
    secondary_skills = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Youngblood';

  -- ── Henchmen ─────────────────────────────────────────────────────────────────

  -- Rename "Ulricans" → "Warriors" (official name); set unlimited max
  update faction_positions set
    name      = 'Warriors',
    max_count = 15
  where faction_id = v_fid and name = 'Ulricans';

  -- Delete "Wolves" — not in official core Middenheim roster
  delete from faction_positions
  where faction_id = v_fid and name = 'Wolves';

  -- Add Marksmen (0-7, 25gc)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Marksmen', 'henchman', false, 0, 7,
     4, 3, 3, 3, 3, 1, 3, 1, 7,
     ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 5);

  -- Add Swordsmen (WS4, 35gc, Expert Swordsmen, max 5)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Swordsmen', 'henchman', false, 0, 5,
     4, 4, 3, 3, 3, 1, 3, 1, 7,
     ARRAY[]::text[], ARRAY[]::text[],
     ARRAY['Expert Swordsmen: may re-roll failed hits when charging (sword armed only)'],
     35, 6);
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- UNDEAD
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_fid uuid;
begin
  select id into v_fid from factions where name = 'Undead';

  -- Faction special rules: individual units carry their own rules;
  -- no warband-level special rule block exists in the official PDF.
  update factions set
    special_rules = ARRAY[]::text[]
  where id = v_fid;

  -- Vampire: WS 5→4, BS 3→4, cost 100→110, add Strength to skills, update special rules
  update faction_positions set
    weapon_skill   = 4,
    ballistic_skill = 4,
    cost           = 110,
    primary_skills = ARRAY['Combat','Academic','Strength','Speed'],
    special_rules  = ARRAY[
      'Leader: warriors within 6" may use the Vampire''s Leadership',
      'Cause Fear',
      'Immune to Psychology',
      'Immune to Poison',
      'No Pain: treat Stunned results as Knocked Down'
    ]
  where faction_id = v_fid and name = 'Vampire';

  -- Necromancer: Ld 8→7; fix skills (Academic + Speed primary, no Combat secondary)
  update faction_positions set
    leadership       = 7,
    primary_skills   = ARRAY['Academic','Speed'],
    secondary_skills = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Necromancer';

  -- Dregs (currently named "Dreg"): WS 3→2, BS 3→2, Ld 5→7, cost 25→20,
  --   max_count 2→3, skills Combat+Strength (not Combat+Speed)
  update faction_positions set
    name             = 'Dregs',
    weapon_skill     = 2,
    ballistic_skill  = 2,
    leadership       = 7,
    cost             = 20,
    max_count        = 3,
    primary_skills   = ARRAY['Combat','Strength'],
    secondary_skills = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Dreg';

  -- Zombie: Ld 4→5, max_count 5→15 (unlimited in practice); update special rules
  update faction_positions set
    leadership  = 5,
    max_count   = 15,
    special_rules = ARRAY[
      'Cause Fear',
      'May Not Run: may not run, but may charge normally',
      'Immune to Psychology',
      'Immune to Poison',
      'No Pain: treat Stunned results as Knocked Down',
      'No Brain: never gains experience'
    ]
  where faction_id = v_fid and name = 'Zombie';

  -- Ghoul: M 5→4, WS 3→2, BS 0→2, A 1→2; update special rules
  update faction_positions set
    move            = 4,
    weapon_skill    = 2,
    ballistic_skill = 2,
    attacks         = 2,
    special_rules   = ARRAY['Cause Fear']
  where faction_id = v_fid and name = 'Ghoul';

  -- Add Dire Wolves (0-5, 50gc)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Dire Wolves', 'henchman', false, 0, 5,
     9, 3, 0, 4, 3, 1, 2, 1, 4,
     ARRAY[]::text[], ARRAY[]::text[],
     ARRAY[
       'Cause Fear',
       'May Not Run: may not run, but may charge normally',
       'Immune to Psychology',
       'Immune to Poison',
       'No Pain: treat Stunned results as Knocked Down',
       'Slavering Charge: fights with 2 attacks on the turn it charges',
       'No Brain: never gains experience'
     ],
     50, 6);
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SKAVEN (CLAN ESHIN)
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_fid uuid;
begin
  select id into v_fid from factions where name = 'Skaven';

  -- Faction special rules: none warband-level in the official PDF.
  update factions set
    special_rules = ARRAY[]::text[]
  where id = v_fid;

  -- Assassin Adept: M 5→6, S 3→4, cost 45→60; fix skills; update special rules
  update faction_positions set
    move           = 6,
    strength       = 4,
    cost           = 60,
    primary_skills = ARRAY['Combat','Shooting','Academic','Strength','Speed','Special'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY[
      'Leader: warriors within 6" may use the Adept''s Leadership',
      'Perfect Killer: always applies an extra -1 modifier to enemy armour saves'
    ]
  where faction_id = v_fid and name = 'Assassin Adept';

  -- Black Skaven: M 5→6, S 3→4, cost 35→40; fix skills; remove "Skaven" placeholder
  update faction_positions set
    move           = 6,
    strength       = 4,
    cost           = 40,
    primary_skills = ARRAY['Combat','Shooting','Strength','Speed','Special'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Black Skaven';

  -- Night Runner: WS 3→2, I 5→4, Ld 5→4; fix skills; remove "Skaven" placeholder
  update faction_positions set
    weapon_skill   = 2,
    initiative     = 4,
    leadership     = 4,
    primary_skills = ARRAY['Combat','Shooting','Special'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Night Runner';

  -- Verminkin: min_count 3→0, cost 25→20; remove "Skaven" placeholder
  update faction_positions set
    min_count     = 0,
    cost          = 20,
    special_rules = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Verminkin';

  -- Giant Rat: WS 3→2, cost 10→15, max_count 5→15 (unlimited); update special rules
  update faction_positions set
    weapon_skill  = 2,
    cost          = 15,
    max_count     = 15,
    special_rules = ARRAY[
      'Pack Size: you may recruit as many Giant Rats as you wish',
      'Animal: never gains experience'
    ]
  where faction_id = v_fid and name = 'Giant Rat';

  -- Add Eshin Sorcerer (0-1, 45gc)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Eshin Sorcerer', 'hero', false, 0, 1,
     5, 3, 3, 3, 3, 1, 4, 1, 6,
     ARRAY['Academic','Speed','Special'], ARRAY[]::text[],
     ARRAY['Wizard: uses Magic of the Horned Rat'],
     45, 6);

  -- Add Rat Ogre (0-1, 210gc)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Rat Ogre', 'henchman', false, 0, 1,
     6, 3, 3, 5, 5, 3, 4, 3, 4,
     ARRAY[]::text[], ARRAY[]::text[],
     ARRAY[
       'Fear: Rat Ogres cause fear',
       'Stupidity: subject to stupidity unless a Skaven hero is within 6"',
       'Large Target',
       'Animal: never gains experience'
     ],
     210, 7);
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SISTERS OF SIGMAR
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_fid uuid;
begin
  select id into v_fid from factions where name = 'Sisters of Sigmar';

  -- Faction special rules: official PDF has no warband-wide special rule block.
  update factions set
    special_rules = ARRAY[]::text[]
  where id = v_fid;

  -- Matriarch: cost 50→70; add Strength and Special to skills
  update faction_positions set
    cost           = 70,
    primary_skills = ARRAY['Combat','Academic','Strength','Speed','Special'],
    special_rules  = ARRAY[
      'Leader: warriors within 6" may use the Matriarch''s Leadership',
      'Prayers of Sigmar'
    ]
  where faction_id = v_fid and name = 'Matriarch';

  -- Rename "Sigmarite Sister" (hero) → "Sister Superior"; max_count 2→3; fix skills
  -- Official: Combat, Academic, Strength, Speed, Special (no Shooting)
  update faction_positions set
    name             = 'Sister Superior',
    max_count        = 3,
    primary_skills   = ARRAY['Combat','Academic','Strength','Speed','Special'],
    secondary_skills = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Sigmarite Sister' and warrior_type = 'hero';

  -- Augur: Ld 6→7; fix special rules (Blessed Sight, not "Seer"); fix skills
  update faction_positions set
    leadership     = 7,
    primary_skills = ARRAY['Academic','Speed','Special'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY[
      'Blessed Sight: may re-roll any failed characteristic tests and to-hit rolls (must accept second result); if not taken out of action, roll two dice in Exploration and pick either',
      'No Armour: may never wear armour'
    ]
  where faction_id = v_fid and name = 'Augur';

  -- Rename "Sister" (henchman) → "Sigmarite Sister"; unlimited max count
  update faction_positions set
    name      = 'Sigmarite Sister',
    max_count = 15
  where faction_id = v_fid and name = 'Sister' and warrior_type = 'henchman';

  -- Novitiate: max_count 5→10
  update faction_positions set max_count = 10
  where faction_id = v_fid and name = 'Novitiate';
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- WITCH HUNTERS
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_fid uuid;
begin
  select id into v_fid from factions where name = 'Witch Hunters';

  -- Max warband size 15→12 (official cap)
  update factions set
    max_warband_size = 12,
    special_rules    = ARRAY[]::text[]
  where id = v_fid;

  -- Witch Hunter Captain: add Strength to skills; add special rules
  update faction_positions set
    primary_skills = ARRAY['Combat','Shooting','Academic','Strength','Speed'],
    special_rules  = ARRAY[
      'Leader: warriors within 6" may use the Captain''s Leadership',
      'Burn the Witch!: hates all models who can cast spells'
    ]
  where faction_id = v_fid and name = 'Witch Hunter Captain';

  -- Witch Hunter (hero): WS 4→3, cost 35→25; fix skills; add special rules
  update faction_positions set
    weapon_skill   = 3,
    cost           = 25,
    primary_skills = ARRAY['Combat','Shooting','Academic','Speed'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY['Burn the Witch!: hates all models who can cast spells']
  where faction_id = v_fid and name = 'Witch Hunter' and warrior_type = 'hero';

  -- Warrior Priest: WS 4→3, S 4→3, T 4→3, cost 45→40; fix skills (no Speed)
  update faction_positions set
    weapon_skill   = 3,
    strength       = 3,
    toughness      = 3,
    cost           = 40,
    primary_skills = ARRAY['Combat','Academic','Strength'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY['Prayers of Sigmar']
  where faction_id = v_fid and name = 'Warrior Priest';

  -- Delete Flagellant (hero) — not in the official Witch Hunters PDF
  delete from faction_positions
  where faction_id = v_fid and name = 'Flagellant' and warrior_type = 'hero';

  -- Zealots (henchman): WS 3→2, BS 3→2, cost 25→20; rename plural→singular
  update faction_positions set
    name            = 'Zealot',
    weapon_skill    = 2,
    ballistic_skill = 2,
    cost            = 20
  where faction_id = v_fid and name = 'Zealots';

  -- Flagellants (henchman): BS 0→3, S 3→4, T 3→4, I 2→3, cost 30→40
  update faction_positions set
    ballistic_skill = 3,
    strength        = 4,
    toughness       = 4,
    initiative      = 3,
    cost            = 40,
    special_rules   = ARRAY[
      'Fanatical: automatically pass all Leadership-based tests; may never become warband leader',
      'No Missile Weapons: may never use missile weapons even if an Advance roll would allow it'
    ]
  where faction_id = v_fid and name = 'Flagellants' and warrior_type = 'henchman';

  -- Add Warhounds (0-5, 15gc)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Warhounds', 'henchman', false, 0, 5,
     6, 4, 0, 4, 3, 1, 4, 1, 5,
     ARRAY[]::text[], ARRAY[]::text[],
     ARRAY['Animal: never gains experience'],
     15, 7);
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- ORCS & GOBLINS
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_fid uuid;
begin
  select id into v_fid from factions where name = 'Orcs & Goblins';

  -- Faction special rules: keep Animosity + Mob Rule (these match the official PDF)

  -- Orc Boss: BS 3→4, cost 50→80; fix skills; add Leader special rule
  update faction_positions set
    ballistic_skill = 4,
    cost            = 80,
    primary_skills  = ARRAY['Combat','Shooting','Strength','Speed','Special'],
    secondary_skills = ARRAY[]::text[],
    special_rules   = ARRAY['Leader: warriors within 6" may use the Boss''s Leadership']
  where faction_id = v_fid and name = 'Orc Boss';

  -- Orc Shaman: cost 45→40; fix skills to Strength + Special only; update special rules
  update faction_positions set
    cost           = 40,
    primary_skills = ARRAY['Strength','Special'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY[
      'Wizard: uses Waaagh! Magic',
      'May never wear armour'
    ]
  where faction_id = v_fid and name = 'Orc Shaman';

  -- Orc Big 'Un: BS 2→3, cost 35→40; fix skills
  update faction_positions set
    ballistic_skill = 3,
    cost            = 40,
    primary_skills  = ARRAY['Combat','Shooting','Strength','Special'],
    secondary_skills = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Orc Big ''Un';

  -- Delete "Goblin" hero — Goblins are henchmen, not heroes, in the official rules
  delete from faction_positions
  where faction_id = v_fid and name = 'Goblin' and warrior_type = 'hero';

  -- Orc Boys: I 3→2; add Animosity; rename to "Orc Boyz"
  update faction_positions set
    name          = 'Orc Boyz',
    initiative    = 2,
    special_rules = ARRAY['Animosity: roll D6 at start of turn; on 1, roll again for reaction']
  where faction_id = v_fid and name = 'Orc Boys';

  -- Delete "Night Goblins" — not a separate unit in official Orc Mob; replaced by Goblin Warriors
  delete from faction_positions
  where faction_id = v_fid and name = 'Night Goblins';

  -- Troll: M 4→6, cost 70→200; update special rules
  update faction_positions set
    move          = 6,
    cost          = 200,
    special_rules = ARRAY[
      'Fear: Trolls cause fear',
      'Stupidity',
      'Regeneration: on a 4+ ignore any wound received (not from fire)',
      'Vomit Attack: instead of normal attacks, make one auto-hit S5 attack that ignores armour saves',
      'Always Hungry: pay 15 gc upkeep after every game or sacrifice 2 Goblin Warriors/Cave Squigs',
      'Dumb Monster: never gains experience'
    ]
  where faction_id = v_fid and name = 'Troll';

  -- Add Goblin Warriors henchman (0-unlimited, 15gc, no more than 2 per Orc)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Goblin Warriors', 'henchman', false, 0, 15,
     4, 2, 3, 3, 3, 1, 3, 1, 5,
     ARRAY[]::text[], ARRAY[]::text[],
     ARRAY[
       'Animosity: roll D6 at start of turn; on 1, roll again for reaction',
       'Not Orcs: each Goblin or Cave Squig taken out of action counts as only half a model for Rout tests',
       'Runts: if ''Lad''s Got Talent'' is rolled, the Goblin is immediately killed'
     ],
     15, 5);

  -- Add Cave Squigs (0-5, 15gc; average M7 for 2D6 movement)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Cave Squigs', 'henchman', false, 0, 5,
     7, 4, 0, 4, 3, 1, 4, 1, 5,
     ARRAY[]::text[], ARRAY[]::text[],
     ARRAY[
       'Variable Movement: move 2D6" each phase (recorded as average M7)',
       'Minderz: must stay within 6" of a Goblin Warrior; if none within 6", goes Wild',
       'Not Orcs: counts as half a model for Rout purposes',
       'Animal: never gains experience'
     ],
     15, 8);
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CULT OF THE POSSESSED
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_fid uuid;
begin
  select id into v_fid from factions where name = 'Cult of the Possessed';

  -- Faction special rules: the official PDF has no warband-level special rule block.
  update factions set
    special_rules = ARRAY[]::text[]
  where id = v_fid;

  -- Magister: BS 3→4, cost 60→70
  update faction_positions set
    ballistic_skill = 4,
    cost            = 70,
    special_rules   = ARRAY[
      'Leader: warriors within 6" may use the Magister''s Leadership',
      'Wizard: uses Chaos Rituals'
    ]
  where faction_id = v_fid and name = 'Magister';

  -- Possessed: M 4→5, W 1→2, I 3→4, min_count 1→0, cost 50→90;
  --   add Strength to skills
  update faction_positions set
    move           = 5,
    wounds         = 2,
    initiative     = 4,
    min_count      = 0,
    cost           = 90,
    primary_skills = ARRAY['Combat','Strength','Speed'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY[
      'Cause Fear',
      'Mutations: may have one or more mutations; subsequent mutations cost double; never use weapons or armour'
    ]
  where faction_id = v_fid and name = 'Possessed';

  -- Mutant: BS 2→3, cost 30→25
  update faction_positions set
    ballistic_skill = 3,
    cost            = 25,
    special_rules   = ARRAY['Mutations: must start with at least one mutation; subsequent mutations cost double']
  where faction_id = v_fid and name = 'Mutant';

  -- Darksouls: S 3→4, cost 15→35; add Crazed special rule
  update faction_positions set
    strength      = 4,
    cost          = 35,
    special_rules = ARRAY['Crazed: automatically pass all Leadership-based tests']
  where faction_id = v_fid and name = 'Darksouls';

  -- Brethren: max_count 5→15 (unlimited, subject to warband cap)
  update faction_positions set max_count = 15
  where faction_id = v_fid and name = 'Brethren';

  -- Add Beastmen Gors henchman (0-3, 45gc) — these Gors have T4, W2, Ld7
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Beastmen', 'henchman', false, 0, 3,
     4, 4, 3, 3, 4, 2, 3, 1, 7,
     ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 45, 6);
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- BEASTMEN RAIDERS
-- Sources: Beastmen, Errata'd.pdf (unofficial errata; no official PDF available)
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_fid uuid;
begin
  select id into v_fid from factions where name = 'Beastmen Raiders';

  -- Faction special rules: no Hired Swords allowed (official rule)
  update factions set
    special_rules = ARRAY[
      'No Hired Swords: Beastmen may never hire any Hired Swords'
    ]
  where id = v_fid;

  -- Rename "Beastman Shaman" (leader) → "Beastmen Chieftain"
  -- Stats: Ld 8→7, cost 70→65; update skills & special rules
  update faction_positions set
    name           = 'Beastmen Chieftain',
    leadership     = 7,
    cost           = 65,
    primary_skills = ARRAY['Combat','Strength','Speed','Special'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY[
      'Leader: warriors within 6" may use the Chieftain''s Leadership'
    ]
  where faction_id = v_fid and name = 'Beastman Shaman' and is_leader = true;

  -- Bestigor: cost 55→45; remove Cause Fear and Scaly Skin (incorrect); fix skills
  update faction_positions set
    cost           = 45,
    primary_skills = ARRAY['Combat','Strength','Special'],
    secondary_skills = ARRAY[]::text[],
    special_rules  = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Bestigor';

  -- Delete "Ungor" hero — Ungors are henchmen, not heroes, in the official rules
  delete from faction_positions
  where faction_id = v_fid and name = 'Ungor' and warrior_type = 'hero';

  -- Gors (henchman): WS 3→4, S 4→3, T 3→4, min_count 3→0, max_count 7→5,
  --   cost 30→35; remove Cause Fear
  update faction_positions set
    weapon_skill  = 4,
    strength      = 3,
    toughness     = 4,
    min_count     = 0,
    max_count     = 5,
    cost          = 35,
    special_rules = ARRAY[]::text[]
  where faction_id = v_fid and name = 'Gors';

  -- Ungors (henchman): Ld 5→6, cost 20→25
  update faction_positions set
    leadership = 6,
    cost       = 25,
    special_rules = ARRAY['Lowest of the Low: if ''Lad''s Got Talent'' is rolled, re-roll it']
  where faction_id = v_fid and name = 'Ungors';

  -- Chaos Warhound: M 6→7, I 4→3, cost 25→15, max_count 3→5
  update faction_positions set
    move      = 7,
    initiative = 3,
    cost      = 15,
    max_count = 5,
    special_rules = ARRAY['Animal: never gains experience']
  where faction_id = v_fid and name = 'Chaos Warhound';

  -- Add Beastmen Shaman hero (separate from Chieftain)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Beastmen Shaman', 'hero', false, 0, 1,
     5, 4, 3, 3, 4, 1, 3, 1, 6,
     ARRAY['Combat','Academic','Special'], ARRAY[]::text[],
     ARRAY[
       'Wizard: uses Chaos Rituals',
       'May never wear armour'
     ],
     45, 7);

  -- Add Minotaur henchman (0-1, 200gc)
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_fid, 'Minotaur', 'henchman', false, 0, 1,
     6, 4, 3, 4, 4, 3, 4, 3, 8,
     ARRAY[]::text[], ARRAY[]::text[],
     ARRAY[
       'Fear: Minotaurs cause fear',
       'Large: any model may shoot at a Minotaur even if not the closest target',
       'Bloodgreed: if the Minotaur puts all opponents out of action, it becomes frenzied on a 4+',
       'Animal: although it may gain experience, it may never become a Hero'
     ],
     200, 8);
end $$;
