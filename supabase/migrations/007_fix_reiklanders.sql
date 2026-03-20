-- Migration 007: Fix Reiklanders warband data
-- Source: broheim.net/downloads/warbands/official/Mercenaries.pdf
-- Corrections:
--   Captain: cost 40→60 gc; add Strength to skill list
--   Champion: Initiative 4→3; skill list corrected to Combat/Strength/Speed
--   Youngblood: primary skills corrected to Combat/Strength/Speed
--   "Swordsmen" henchman renamed to "Warriors", max_count set to 15 (no cap)
--   Marksmen max_count 5→7
--   "Beggars" removed (not a Reikland unit)
--   New "Swordsmen" added: WS4, 35 gc, Expert Swordsmen special rule
--   Faction special_rules updated to correct warband rules

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Reiklanders';

  -- Fix faction-level special rules
  update factions set
    special_rules = ARRAY[
      'Extended Leadership: fighters within 12" (not 6") may use the Captain''s Leadership',
      'Expert Marksmen: all Marksmen add +1 to their Ballistic Skill'
    ]
  where id = v_faction_id;

  -- Fix Captain: cost 40→60 gc; add Strength to primary skill list
  update faction_positions set
    cost = 60,
    primary_skills = ARRAY['Combat','Shooting','Academic','Strength','Speed']
  where faction_id = v_faction_id and name = 'Captain';

  -- Fix Champion: Initiative 4→3; correct skill lists
  update faction_positions set
    initiative = 3,
    primary_skills = ARRAY['Combat','Strength','Speed'],
    secondary_skills = ARRAY[]::text[]
  where faction_id = v_faction_id and name = 'Champion';

  -- Fix Youngblood: correct skill lists (Combat/Strength/Speed primary, nothing secondary)
  update faction_positions set
    primary_skills = ARRAY['Combat','Strength','Speed'],
    secondary_skills = ARRAY[]::text[]
  where faction_id = v_faction_id and name = 'Youngblood';

  -- Rename "Swordsmen" henchman to "Warriors" and remove max cap
  -- (Warriors have WS3, no limit within warband size — max_count=15 reflects warband cap)
  update faction_positions set
    name = 'Warriors',
    max_count = 15
  where faction_id = v_faction_id and name = 'Swordsmen' and warrior_type = 'henchman';

  -- Fix Marksmen: max count 5→7
  update faction_positions set
    max_count = 7
  where faction_id = v_faction_id and name = 'Marksmen';

  -- Delete Beggars — not a Reikland unit type
  delete from faction_positions
  where faction_id = v_faction_id and name = 'Beggars';

  -- Add correct Swordsmen henchman:
  --   WS4, BS3, 35 gc, max 5, Expert Swordsmen special rule
  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count,
     move, weapon_skill, ballistic_skill, strength, toughness, wounds,
     initiative, attacks, leadership,
     primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Swordsmen', 'henchman', false, 0, 5,
     4, 4, 3, 3, 3, 1,
     3, 1, 7,
     ARRAY[]::text[], ARRAY[]::text[],
     ARRAY['Expert Swordsmen: may re-roll failed hits when charging (sword armed only)'],
     35, 7);

end $$;
