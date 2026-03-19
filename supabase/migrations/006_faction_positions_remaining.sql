-- ============================================================
-- Mordheim Manager — Seed: Faction Positions (Remaining 6)
-- Migration: 006_faction_positions_remaining
-- Stat lines from Mordheim 2019 Town Cryer compilation
-- Marienburg, Middenheim, Witch Hunters, Orcs & Goblins,
-- Cult of the Possessed, Beastmen Raiders
-- ============================================================

-- ── Faction Positions: Marienburg Merchants ───────────────────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Marienburg Merchants';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Merchant', 'hero', true, 1, 1, 4, 4, 4, 3, 3, 1, 4, 1, 8,
      ARRAY['Combat','Shooting','Academic','Speed'], ARRAY[]::text[], ARRAY[]::text[], 60, 1),
    (v_faction_id, 'Merchant''s Bodyguard', 'hero', false, 0, 2, 4, 4, 3, 3, 3, 1, 3, 1, 7,
      ARRAY['Combat','Shooting','Speed'], ARRAY['Academic'], ARRAY[]::text[], 35, 2),
    (v_faction_id, 'Merchant''s Apprentice', 'hero', false, 0, 2, 4, 3, 3, 3, 3, 1, 3, 1, 6,
      ARRAY['Combat','Academic'], ARRAY['Shooting','Speed'], ARRAY[]::text[], 25, 3),
    (v_faction_id, 'Swordsmen', 'henchman', false, 0, 5, 4, 3, 3, 3, 3, 1, 3, 1, 7,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 4),
    (v_faction_id, 'Marksmen', 'henchman', false, 0, 5, 4, 3, 3, 3, 3, 1, 3, 1, 7,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 5),
    (v_faction_id, 'Dregs', 'henchman', false, 0, 3, 4, 2, 2, 3, 3, 1, 3, 1, 5,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 15, 6);
end $$;

-- ── Faction Positions: Middenheim Mercenaries ─────────────────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Middenheim Mercenaries';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Champion of Ulric', 'hero', true, 1, 1, 4, 4, 3, 3, 3, 1, 4, 1, 8,
      ARRAY['Combat','Shooting','Speed'], ARRAY['Academic'], ARRAY[]::text[], 50, 1),
    (v_faction_id, 'Warrior of Ulric', 'hero', false, 0, 2, 4, 4, 3, 3, 3, 1, 3, 1, 7,
      ARRAY['Combat','Speed'], ARRAY['Shooting'], ARRAY[]::text[], 35, 2),
    (v_faction_id, 'Youngblood', 'hero', false, 0, 2, 4, 2, 2, 3, 3, 1, 3, 1, 6,
      ARRAY['Combat','Speed'], ARRAY['Shooting','Academic'], ARRAY[]::text[], 15, 3),
    (v_faction_id, 'Ulricans', 'henchman', false, 0, 5, 4, 3, 3, 3, 3, 1, 3, 1, 7,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 4),
    (v_faction_id, 'Wolves', 'henchman', false, 0, 3, 9, 4, 0, 3, 3, 1, 4, 1, 5,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Animal','Cause Fear']::text[], 25, 5);
end $$;

-- ── Faction Positions: Witch Hunters ──────────────────────────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Witch Hunters';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Witch Hunter Captain', 'hero', true, 1, 1, 4, 4, 4, 3, 3, 1, 4, 1, 8,
      ARRAY['Combat','Shooting','Academic','Speed'], ARRAY[]::text[], ARRAY[]::text[], 60, 1),
    (v_faction_id, 'Witch Hunter', 'hero', false, 0, 3, 4, 4, 3, 3, 3, 1, 3, 1, 7,
      ARRAY['Combat','Shooting'], ARRAY['Academic','Speed'], ARRAY[]::text[], 35, 2),
    (v_faction_id, 'Warrior Priest', 'hero', false, 0, 1, 4, 4, 3, 4, 4, 1, 3, 1, 8,
      ARRAY['Combat','Academic'], ARRAY['Speed'], ARRAY['Prayers of Sigmar']::text[], 45, 3),
    (v_faction_id, 'Flagellant', 'hero', false, 0, 1, 4, 4, 0, 3, 3, 1, 2, 2, 10,
      ARRAY['Combat'], ARRAY[]::text[], ARRAY['Frenzy','Immune to Psychology','Flagellant']::text[], 30, 4),
    (v_faction_id, 'Zealots', 'henchman', false, 0, 5, 4, 3, 3, 3, 3, 1, 3, 1, 7,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 5),
    (v_faction_id, 'Flagellants', 'henchman', false, 0, 5, 4, 3, 0, 3, 3, 1, 2, 1, 10,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Frenzy','Immune to Psychology','Flagellant']::text[], 30, 6);
end $$;

-- ── Faction Positions: Orcs & Goblins ─────────────────────────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Orcs & Goblins';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Orc Boss', 'hero', true, 1, 1, 4, 4, 3, 4, 4, 1, 3, 1, 8,
      ARRAY['Combat','Speed'], ARRAY['Shooting'], ARRAY[]::text[], 50, 1),
    (v_faction_id, 'Orc Shaman', 'hero', false, 0, 1, 4, 3, 3, 3, 4, 1, 3, 1, 7,
      ARRAY['Academic','Combat'], ARRAY['Speed'], ARRAY['Waaagh! Magic']::text[], 45, 2),
    (v_faction_id, 'Orc Big ''Un', 'hero', false, 0, 2, 4, 4, 2, 4, 4, 1, 3, 1, 7,
      ARRAY['Combat','Speed'], ARRAY[]::text[], ARRAY[]::text[], 35, 3),
    (v_faction_id, 'Goblin', 'hero', false, 0, 2, 4, 2, 3, 3, 3, 1, 3, 1, 6,
      ARRAY['Speed'], ARRAY['Combat','Shooting'], ARRAY[]::text[], 15, 4),
    (v_faction_id, 'Orc Boys', 'henchman', false, 0, 7, 4, 3, 3, 3, 4, 1, 3, 1, 7,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 5),
    (v_faction_id, 'Night Goblins', 'henchman', false, 0, 7, 4, 2, 3, 3, 3, 1, 2, 1, 6,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Animosity']::text[], 15, 6),
    (v_faction_id, 'Troll', 'henchman', false, 0, 1, 4, 3, 1, 5, 4, 3, 1, 3, 4,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Cause Fear','Regenerate','Stupid']::text[], 70, 7);
end $$;

-- ── Faction Positions: Cult of the Possessed ──────────────────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Cult of the Possessed';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Magister', 'hero', true, 1, 1, 4, 4, 3, 3, 3, 1, 3, 1, 8,
      ARRAY['Combat','Academic','Speed'], ARRAY[]::text[], ARRAY['Chaos Rituals']::text[], 60, 1),
    (v_faction_id, 'Possessed', 'hero', false, 1, 2, 4, 4, 0, 4, 4, 1, 3, 2, 7,
      ARRAY['Combat'], ARRAY['Speed'], ARRAY['Cause Fear','Mutation']::text[], 50, 2),
    (v_faction_id, 'Mutant', 'hero', false, 0, 2, 4, 3, 2, 3, 3, 1, 3, 1, 7,
      ARRAY['Combat','Speed'], ARRAY['Academic'], ARRAY['Mutation']::text[], 30, 3),
    (v_faction_id, 'Brethren', 'henchman', false, 0, 5, 4, 3, 3, 3, 3, 1, 3, 1, 7,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 4),
    (v_faction_id, 'Darksouls', 'henchman', false, 0, 5, 4, 2, 2, 3, 3, 1, 3, 1, 6,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 15, 5);
end $$;

-- ── Faction Positions: Beastmen Raiders ───────────────────────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Beastmen Raiders';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Beastman Shaman', 'hero', true, 1, 1, 5, 4, 3, 4, 4, 1, 4, 1, 8,
      ARRAY['Combat','Academic','Speed'], ARRAY[]::text[], ARRAY['Beast Magic','Cause Fear']::text[], 70, 1),
    (v_faction_id, 'Bestigor', 'hero', false, 0, 2, 5, 4, 3, 4, 4, 1, 3, 1, 7,
      ARRAY['Combat','Speed'], ARRAY[]::text[], ARRAY['Cause Fear','Scaly Skin']::text[], 55, 2),
    (v_faction_id, 'Ungor', 'hero', false, 0, 2, 5, 3, 3, 3, 3, 1, 3, 1, 6,
      ARRAY['Speed','Combat'], ARRAY['Shooting'], ARRAY[]::text[], 25, 3),
    (v_faction_id, 'Gors', 'henchman', false, 3, 7, 5, 3, 3, 4, 3, 1, 3, 1, 6,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Cause Fear']::text[], 30, 4),
    (v_faction_id, 'Ungors', 'henchman', false, 0, 5, 5, 3, 3, 3, 3, 1, 3, 1, 5,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 20, 5),
    (v_faction_id, 'Chaos Warhound', 'henchman', false, 0, 3, 6, 3, 0, 4, 3, 1, 4, 1, 5,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Animal','Cause Fear']::text[], 25, 6);
end $$;
