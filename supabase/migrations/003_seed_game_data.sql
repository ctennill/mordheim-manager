-- ============================================================
-- Mordheim Manager — Seed: Game Data
-- Migration: 003_seed_game_data
-- Scenarios, Territories, and 10 Launch Factions (PRD-000 §4)
-- Stat lines from Mordheim 2019 Town Cryer compilation
-- ============================================================

-- ── Scenarios (PRD-004 §4.5) ─────────────────────────────────────────────────

insert into scenarios (name, ruleset, attacker_defender, description, sort_order) values
  ('Wyrdstone Hunt',    'core', false, 'Both warbands search for shards of wyrdstone scattered across the battlefield.',  1),
  ('Breakthrough',      'core', true,  'The attacker must get models off the far table edge; the defender tries to stop them.',  2),
  ('Street Fight',      'core', false, 'A straight battle to the last warband standing.',  3),
  ('Occupy',            'core', true,  'The attacker must hold a building at the end of the game.',  4),
  ('Ambush!',           'core', true,  'The attacker sets up normally; the defender deploys after and is caught by surprise.',  5),
  ('Hidden Treasure',   'core', false, 'One building hides a cache of wyrdstone — find it first.',  6),
  ('Defend the Find',   'core', true,  'The defender holds a position loaded with treasure; the attacker must capture it.',  7),
  ('The Gauntlet',      'core', true,  'The attacker must run a gauntlet of the defender''s forces.',  8),
  ('Treasure Hunt',     'core', false, 'Treasure is scattered across the board — collect as much as possible.',  9),
  ('Attack and Defend', 'core', true,  'A classic assault scenario — take the enemy stronghold.',  10),
  ('The Assassin',      'core', true,  'One warrior must eliminate a specific target from the enemy warband.',  11),
  ('Chance Encounter',  'core', false, 'Two warbands stumble across each other — a chaotic brawl ensues.',  12);

-- ── Territories (PRD-007) ────────────────────────────────────────────────────

insert into territories (name, income_bonus, special_rules, description) values
  ('Ruined Hovels',         0,  null, 'Modest ruins offering little income but a defensible position.'),
  ('Alchemist''s Laboratory', 20, 'Wyrdstone Processing: may convert wyrdstone shards to gold crowns at +10 gc per shard.', 'A crumbling laboratory stocked with alchemical equipment.'),
  ('Shrine',                0,  'Blessed Ground: one warrior per battle may re-roll one failed armour save.', 'A holy shrine to one of the gods of the Old World.'),
  ('Marketplace',           20, null, 'A busy marketplace offering regular trading income.'),
  ('Warpsone Cache',        20, 'Rich Pickings: generate +D6 wyrdstone shards during the Exploration phase.', 'A vein of raw warpstone running under this section of the city.'),
  ('Settlement',            10, null, 'A small community of survivors paying tribute for protection.'),
  ('Graveyard',             0,  'Corpse Robbing: may search the graveyard for equipment after each battle (roll as Exploration).', 'A desolate graveyard filled with the city''s dead.'),
  ('Tavern',                15, 'Recruiting Ground: reduce cost of hiring new henchmen by 5 gc.', 'A still-functioning tavern where mercenaries gather.'),
  ('Smithy',                0,  'Weapon Smithing: one item of equipment may be repaired or crafted each session at half cost.', 'A working smithy with tools and materials.'),
  ('Sorcerer''s Mansion',   0,  'Arcane Knowledge: one hero may learn a spell or magic skill once per campaign.', 'The crumbling mansion of a powerful sorcerer.'),
  ('Storehouse',            10, 'Supply Cache: warband treasury cannot fall below 0 gold crowns (commissioners may waive).', 'A large storehouse filled with supplies and goods.'),
  ('Library',               0,  'Tome of Knowledge: one hero gains +1 XP per session while holding this territory.', 'A vast library with tomes of arcane and mundane knowledge.'),
  ('Watchtower',            0,  'High Ground: all missile weapons gain +6'' range for the owning warband in home battles.', 'A tall watchtower overlooking the surrounding ruins.'),
  ('Execution Ground',      0,  'Fear the Reaper: all enemy models must pass a Leadership test or suffer -1 to their WS in the first turn.', 'A grim execution ground littered with gibbets and bones.');

-- ── Equipment Database ────────────────────────────────────────────────────────
-- Common items available across most factions

insert into equipment (name, category, cost, special_rules, rarity, max_per_warrior, description) values
  -- Hand Weapons
  ('Dagger',        'hand_weapon',  2,  ARRAY['Parry on +5 if used as off-hand weapon'], 0, 2, 'A short blade, cheap and reliable.'),
  ('Sword',         'hand_weapon',  10, ARRAY['Parry: confers 6+ armour save if used with a shield'], 0, 2, 'The most common weapon in the Mordheim ruins.'),
  ('Axe',           'hand_weapon',  5,  ARRAY['Ignores shield armour saves'], 0, 2, 'A brutal cleaving weapon.'),
  ('Mace',          'hand_weapon',  3,  ARRAY['+1 to Injury rolls against armoured opponents'], 0, 2, 'A blunt weapon effective against armour.'),
  ('Club',          'hand_weapon',  3,  ARRAY['Stun: +1 to Injury roll results'], 0, 2, 'A simple bludgeoning weapon.'),
  ('Morning Star',  'hand_weapon',  15, ARRAY['Flail: +2 Strength on first round of combat, -1 to hit after'], 0, 1, 'A vicious chain-and-ball weapon.'),
  ('Flail',         'hand_weapon',  15, ARRAY['Flail: +2 Strength on first round of combat'], 0, 1, 'A heavy flail for devastating charges.'),
  -- Two-Handed
  ('Halberd',       'two_handed',   10, ARRAY['+1 Strength', 'Strike Last (unless charging)'], 0, 1, 'A pole weapon combining spear and axe.'),
  ('Double-Handed Weapon', 'two_handed', 15, ARRAY['+2 Strength', 'Strike Last'], 0, 1, 'A massive weapon requiring two hands.'),
  ('Spear',         'hand_weapon',  10, ARRAY['Strike First when defending', 'Can be used with a shield'], 0, 1, 'A long-hafted thrusting weapon.'),
  -- Missile Weapons
  ('Bow',           'missile',      10, ARRAY['Range 24"', 'S3'], 0, 1, 'A simple shortbow.'),
  ('Crossbow',      'missile',      25, ARRAY['Range 30"', 'S4', 'Move or Shoot'], 0, 1, 'A powerful ranged weapon, slow to reload.'),
  ('Pistol',        'missile',      15, ARRAY['Range 8"', 'S4', 'Can be used in hand-to-hand combat'], 0, 2, 'A black powder pistol.'),
  ('Blunderbuss',   'missile',      30, ARRAY['Range 12"', 'S4', 'Hits all in line (template)'], 0, 1, 'A short-range scattershot weapon.'),
  ('Sling',         'missile',      2,  ARRAY['Range 18"', 'S3'], 0, 1, 'A simple ranged weapon using stones.'),
  ('Throwing Knives','missile',     15, ARRAY['Range 6"', 'S3', 'Quick Shot: no penalty for moving and shooting'], 0, 1, 'Balanced blades for short-range throwing.'),
  -- Armor
  ('Light Armour',  'armor',        20, ARRAY['5+ Armour Save'], 0, 1, 'Leather or light mail armour.'),
  ('Heavy Armour',  'armor',        50, ARRAY['4+ Armour Save'], 0, 1, 'Heavy plate or full mail armour.'),
  ('Shield',        'shield',       5,  ARRAY['+1 Armour Save'], 0, 1, 'A simple wooden or iron shield.'),
  ('Buckler',       'shield',       5,  ARRAY['Parry: may parry one attack per combat'], 0, 1, 'A small, agile buckler.'),
  ('Helmet',        'helmet',       10, ARRAY['Stunned results become Knocked Down on a 4+'], 0, 1, 'A metal helmet offering head protection.');

-- ── Factions — 10 Official Launch Factions ────────────────────────────────────

-- 1. Reiklanders
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Reiklanders', 'official', 'core',
  'The Reikland province is the most powerful state in the Empire, and the Reiklanders who venture into Mordheim are its finest mercenaries — disciplined, well-equipped, and driven by profit.',
  ARRAY['Well-Equipped: may purchase any common equipment', 'Superior Training: Heroes may choose from Combat, Shooting, Academic, or Speed skill lists'],
  500, 3, 15, 'law', true
);

-- 2. Marienburg Merchants
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Marienburg Merchants', 'official', 'core',
  'The merchant princes of Marienburg send their agents into the city of the damned — not for glory, but for profit. Their warbands are well-funded and can outfit their men with the best equipment gold can buy.',
  ARRAY['Rich: start with 600 gold crowns instead of 500', 'Hired Expertise: may hire one additional Hired Sword compared to normal limits'],
  600, 3, 15, 'neutral', true
);

-- 3. Middenheim Mercenaries
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Middenheim Mercenaries', 'official', 'core',
  'Worshippers of Ulric, the wolf-god of battle, the men of Middenheim are fierce fighters who favour brutal close combat over finesse. They are harder to kill and fight with reckless abandon.',
  ARRAY['Ulrican Fervour: Champions and Leader may re-roll failed Fear tests', 'Warriors of Ulric: +1 to Strength when charging'],
  500, 3, 15, 'neutral', true
);

-- 4. Undead
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Undead', 'official', 'core',
  'Necromancers and vampires lead shambling hordes of undead into Mordheim, seeking the power of the wyrdstone to fuel their dark arts. They do not tire, do not feel pain, and do not fear death.',
  ARRAY['Cause Fear: Undead models cause Fear', 'Immune to Psychology: Undead models never take Psychology tests', 'Raise Dead: Necromancer may attempt to raise dead warriors as Zombies after each battle'],
  500, 3, 15, 'chaos', true
);

-- 5. Skaven
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Skaven', 'official', 'core',
  'The rat-men of Clan Eshin skulk through Mordheim''s sewers and shadows, drawn by the corrupting power of warpstone — the raw stuff of Chaos that they revere and trade. They are numerous, fast, and utterly treacherous.',
  ARRAY['Infiltrators: Skaven models may set up within 6" of any table edge', 'Scurry Away: if the Skaven leader goes out of action, all Skaven models gain +1 Movement for the rest of the battle'],
  500, 3, 20, 'chaos', true
);

-- 6. Sisters of Sigmar
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Sisters of Sigmar', 'official', 'core',
  'The warrior-priestesses of Sigmar have come to Mordheim to purge the corruption and reclaim the city for the God-Emperor. They are zealous, disciplined, and capable of miraculous feats through their faith.',
  ARRAY['Prayers of Sigmar: the Matriarch (leader) may use Prayers of Sigmar', 'Holy Crusade: Sisters are immune to Fear caused by undead and daemonic enemies', 'Only Women: all models in this warband must be female'],
  500, 3, 15, 'law', true
);

-- 7. Witch Hunters
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Witch Hunters', 'official', 'core',
  'Ruthless agents of the Temple of Sigmar, Witch Hunters pursue heretics, mutants, and the servants of Chaos to the darkest corners of the world — including the cursed city of Mordheim.',
  ARRAY['Witch Finder: Witch Hunters hate all Chaos-aligned warbands', 'Burn the Heretic: once per game may cause all enemy models within 4" to take a S3 hit from a burning brand'],
  500, 3, 15, 'law', true
);

-- 8. Orcs & Goblins
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Orcs & Goblins', 'official', 'core',
  'A raucous mob of Orcs, Goblins, and Trolls has descended on Mordheim, driven by the greenskin love of violence and the vague notion that there is loot to be had. They are numerous, unpredictable, and terrifyingly effective in large numbers.',
  ARRAY['Animosity: at the start of each turn, roll for each goblin and orc not in combat — on a 1 they attack the nearest friendly model', 'Mob Rule: the warband does not take a Rout test until it is below half its starting number'],
  500, 3, 20, 'neutral', true
);

-- 9. Cult of the Possessed
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Cult of the Possessed', 'official', 'core',
  'Twisted worshippers of Chaos who have flooded into Mordheim to claim the warpstone for their dark masters. Their bodies warp and mutate, granting terrible powers — but at a terrible cost.',
  ARRAY['Chaos Rituals: after each battle, Possessed may gain random mutations from the Chaos Mutation table', 'Cause Fear: Possessed models cause Fear', 'Chaos Alignment: may not hire Law-aligned Hired Swords'],
  500, 3, 15, 'chaos', true
);

-- 10. Beastmen Raiders
insert into factions (id, name, type, ruleset, lore, special_rules, starting_gold, min_warband_size, max_warband_size, alignment, is_enabled)
values (
  uuid_generate_v4(), 'Beastmen Raiders', 'official', 'core',
  'Savage children of Chaos, Beastmen have poured into the ruins of Mordheim in great warbands, drawn by the raw warpstone and the scent of blood. Stronger and tougher than humans, they are fearsome opponents in close combat.',
  ARRAY['Cause Fear: Beastmen models cause Fear', 'Scaly Skin: Bestigors have a natural 6+ armour save', 'Raiders: Beastmen ignore all movement penalties for difficult terrain'],
  500, 3, 15, 'chaos', true
);

-- ── Faction Positions: Reiklanders (Example — full set) ──────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Reiklanders';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Captain', 'hero', true, 1, 1, 4, 4, 4, 3, 3, 1, 4, 1, 8,
      ARRAY['Combat','Shooting','Academic','Speed'], ARRAY[]::text[], ARRAY[]::text[], 40, 1),
    (v_faction_id, 'Champion', 'hero', false, 0, 2, 4, 4, 3, 3, 3, 1, 4, 1, 7,
      ARRAY['Combat','Shooting','Academic','Speed'], ARRAY[]::text[], ARRAY[]::text[], 35, 2),
    (v_faction_id, 'Youngblood', 'hero', false, 0, 2, 4, 2, 2, 3, 3, 1, 3, 1, 6,
      ARRAY['Combat','Speed'], ARRAY['Shooting','Academic'], ARRAY[]::text[], 15, 3),
    (v_faction_id, 'Swordsmen', 'henchman', false, 0, 5, 4, 3, 3, 3, 3, 1, 3, 1, 7,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 4),
    (v_faction_id, 'Marksmen', 'henchman', false, 0, 5, 4, 3, 3, 3, 3, 1, 3, 1, 7,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 5),
    (v_faction_id, 'Beggars', 'henchman', false, 0, 3, 4, 2, 2, 3, 3, 1, 3, 1, 6,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 15, 6);
end $$;

-- ── Faction Positions: Skaven ─────────────────────────────────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Skaven';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Assassin Adept', 'hero', true, 1, 1, 5, 4, 4, 3, 3, 1, 5, 1, 7,
      ARRAY['Combat','Speed','Stealth'], ARRAY['Shooting'], ARRAY['Infiltrate','Skaven']::text[], 45, 1),
    (v_faction_id, 'Black Skaven', 'hero', false, 0, 2, 5, 4, 3, 3, 3, 1, 5, 1, 6,
      ARRAY['Combat','Speed'], ARRAY['Stealth'], ARRAY['Skaven']::text[], 35, 2),
    (v_faction_id, 'Night Runner', 'hero', false, 0, 2, 6, 3, 3, 3, 3, 1, 5, 1, 5,
      ARRAY['Speed','Stealth'], ARRAY['Combat'], ARRAY['Skaven']::text[], 20, 3),
    (v_faction_id, 'Verminkin', 'henchman', false, 3, 15, 5, 3, 3, 3, 3, 1, 4, 1, 5,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Skaven']::text[], 25, 4),
    (v_faction_id, 'Giant Rat', 'henchman', false, 0, 5, 6, 3, 0, 3, 3, 1, 4, 1, 4,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Animal','Fear']::text[], 10, 5);
end $$;

-- ── Faction Positions: Undead ─────────────────────────────────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Undead';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Vampire', 'hero', true, 1, 1, 6, 5, 3, 4, 4, 2, 5, 2, 8,
      ARRAY['Combat','Academic','Speed'], ARRAY[]::text[], ARRAY['Cause Fear','Immune to Psychology','Vampire']::text[], 100, 1),
    (v_faction_id, 'Necromancer', 'hero', false, 0, 1, 4, 3, 3, 3, 3, 1, 3, 1, 8,
      ARRAY['Academic'], ARRAY['Combat'], ARRAY['Necromantic Magic']::text[], 35, 2),
    (v_faction_id, 'Dreg', 'hero', false, 0, 2, 4, 3, 3, 3, 3, 1, 3, 1, 5,
      ARRAY['Combat'], ARRAY['Speed'], ARRAY[]::text[], 25, 3),
    (v_faction_id, 'Zombie', 'henchman', false, 0, 5, 4, 2, 0, 3, 3, 1, 1, 1, 4,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Cause Fear','Immune to Psychology','Slow']::text[], 15, 4),
    (v_faction_id, 'Ghoul', 'henchman', false, 0, 3, 5, 3, 0, 3, 4, 1, 3, 1, 5,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY['Cause Fear']::text[], 40, 5);
end $$;

-- ── Faction Positions: Sisters of Sigmar ─────────────────────────────────────

do $$
declare
  v_faction_id uuid;
begin
  select id into v_faction_id from factions where name = 'Sisters of Sigmar';

  insert into faction_positions
    (faction_id, name, warrior_type, is_leader, min_count, max_count, move, weapon_skill, ballistic_skill, strength, toughness, wounds, initiative, attacks, leadership, primary_skills, secondary_skills, special_rules, cost, sort_order)
  values
    (v_faction_id, 'Matriarch', 'hero', true, 1, 1, 4, 4, 4, 3, 3, 1, 4, 1, 8,
      ARRAY['Combat','Academic','Speed'], ARRAY[]::text[], ARRAY['Prayers of Sigmar']::text[], 50, 1),
    (v_faction_id, 'Sigmarite Sister', 'hero', false, 0, 2, 4, 4, 3, 3, 3, 1, 3, 1, 7,
      ARRAY['Combat','Academic'], ARRAY['Speed'], ARRAY[]::text[], 35, 2),
    (v_faction_id, 'Augur', 'hero', false, 0, 1, 4, 2, 2, 3, 3, 1, 3, 1, 6,
      ARRAY['Academic'], ARRAY['Combat'], ARRAY['Seer']::text[], 25, 3),
    (v_faction_id, 'Sister', 'henchman', false, 0, 10, 4, 3, 3, 3, 3, 1, 3, 1, 7,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 25, 4),
    (v_faction_id, 'Novitiate', 'henchman', false, 0, 5, 4, 2, 2, 3, 3, 1, 3, 1, 6,
      ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 15, 5);
end $$;

-- ── Common Equipment: make it available to all official factions ──────────────

insert into faction_equipment (faction_id, equipment_id, is_faction_specific)
select f.id, e.id, false
from factions f
cross join equipment e
where f.type = 'official'
  and e.category in ('hand_weapon', 'missile', 'armor', 'helmet', 'shield')
  and e.name not in ('Blunderbuss'); -- faction-specific items excluded
