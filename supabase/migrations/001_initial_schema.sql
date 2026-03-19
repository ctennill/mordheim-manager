-- ============================================================
-- Mordheim Manager — Initial Database Schema
-- Migration: 001_initial_schema
-- Covers: PRD-001 (Profiles), PRD-002 (Warband Builder),
--         PRD-003 (Warriors), PRD-004 (Campaigns)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────────────────────────

create type warrior_type as enum ('hero', 'henchman');
create type warrior_status as enum ('active', 'recovering', 'captured', 'dead', 'retired');
create type campaign_mode as enum ('standard', 'open', 'event', 'solo');
create type campaign_status as enum ('draft', 'registration', 'active', 'completed', 'archived');
create type campaign_privacy as enum ('public', 'private', 'unlisted');
create type battle_result_type as enum ('win', 'loss', 'draw');
create type pairing_method as enum ('commissioner', 'swiss', 'round_robin', 'random');
create type equipment_category as enum (
  'hand_weapon', 'two_handed', 'missile', 'armor', 'helmet', 'shield', 'miscellaneous', 'magic'
);
create type faction_type as enum ('official', 'supplement', 'custom');
create type session_status as enum ('pending', 'active', 'closed');
create type warband_status as enum ('draft', 'submitted', 'approved', 'rejected', 'active');
create type approval_status as enum ('pending', 'approved', 'rejected');
create type injury_effect as enum (
  'none', 'miss_next_battle', 'stat_modifier', 'skill_loss',
  'equipment_loss', 'gold_loss', 'captured', 'dead', 'special'
);
create type advance_type as enum ('stat', 'skill', 'double', 'lads_got_talent');
create type magic_items_setting as enum ('core', 'all', 'disabled');

-- ── PRD-001: User Profiles ────────────────────────────────────────────────────

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  display_name text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── PRD-002: Game Data — Factions ─────────────────────────────────────────────

create table factions (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null unique,
  type              faction_type not null default 'official',
  ruleset           text not null default 'core', -- 'core' | 'town_cryer' | 'community'
  lore              text,
  special_rules     text[] not null default '{}',
  starting_gold     integer not null default 500,
  min_warband_size  integer not null default 3,
  max_warband_size  integer not null default 15,
  alignment         text, -- 'law' | 'neutral' | 'chaos'
  is_enabled        boolean not null default true,
  created_at        timestamptz not null default now()
);

-- Faction roster positions (heroes and henchman types)
create table faction_positions (
  id               uuid primary key default uuid_generate_v4(),
  faction_id       uuid not null references factions(id) on delete cascade,
  name             text not null,
  warrior_type     warrior_type not null,
  is_leader        boolean not null default false,
  min_count        integer not null default 0,
  max_count        integer not null default 1,
  -- Base stats
  move             integer not null default 4,
  weapon_skill     integer not null default 3,
  ballistic_skill  integer not null default 3,
  strength         integer not null default 3,
  toughness        integer not null default 3,
  wounds           integer not null default 1,
  initiative       integer not null default 3,
  attacks          integer not null default 1,
  leadership       integer not null default 7,
  -- Skill availability
  primary_skills   text[] not null default '{}',
  secondary_skills text[] not null default '{}',
  special_rules    text[] not null default '{}',
  cost             integer not null,
  sort_order       integer not null default 0
);

-- ── PRD-002: Equipment Database ───────────────────────────────────────────────

create table equipment (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null unique,
  category            equipment_category not null,
  cost                integer not null,
  -- Stat modifiers (null = no effect)
  mod_move            integer,
  mod_weapon_skill    integer,
  mod_ballistic_skill integer,
  mod_strength        integer,
  mod_toughness       integer,
  mod_wounds          integer,
  mod_initiative      integer,
  mod_attacks         integer,
  mod_leadership      integer,
  -- Special
  special_rules       text[] not null default '{}',
  rarity              integer not null default 0, -- 0 = common; 1–6 = roll required
  max_per_warrior     integer not null default 1,
  is_magic            boolean not null default false,
  description         text
);

-- Which factions can purchase which equipment
create table faction_equipment (
  faction_id           uuid not null references factions(id) on delete cascade,
  equipment_id         uuid not null references equipment(id) on delete cascade,
  is_faction_specific  boolean not null default false,
  primary key (faction_id, equipment_id)
);

-- ── PRD-002: Warbands ─────────────────────────────────────────────────────────

create table warbands (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid not null references profiles(id) on delete cascade,
  faction_id      uuid not null references factions(id),
  campaign_id     uuid, -- FK added after campaigns table; see below
  name            text not null,
  motto           text,
  background      text,
  status          warband_status not null default 'draft',
  treasury        integer not null default 0,
  warband_rating  integer not null default 0,
  wins            integer not null default 0,
  losses          integer not null default 0,
  draws           integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── PRD-003: Warriors ─────────────────────────────────────────────────────────

create table warriors (
  id                      uuid primary key default uuid_generate_v4(),
  warband_id              uuid not null references warbands(id) on delete cascade,
  faction_position_id     uuid not null references faction_positions(id),
  name                    text, -- null for unnamed henchman groups
  warrior_type            warrior_type not null,
  status                  warrior_status not null default 'active',
  group_count             integer not null default 1, -- 1 for heroes
  experience              integer not null default 0,
  advancements_taken      integer not null default 0,
  -- Current stats (base + all modifiers applied)
  move                    integer not null,
  weapon_skill            integer not null,
  ballistic_skill         integer not null,
  strength                integer not null,
  toughness               integer not null,
  wounds                  integer not null,
  initiative              integer not null,
  attacks                 integer not null,
  leadership              integer not null,
  -- Base stats (immutable after creation)
  base_move               integer not null,
  base_weapon_skill       integer not null,
  base_ballistic_skill    integer not null,
  base_strength           integer not null,
  base_toughness          integer not null,
  base_wounds             integer not null,
  base_initiative         integer not null,
  base_attacks            integer not null,
  base_leadership         integer not null,
  -- Special
  skills                  text[] not null default '{}',
  special_rules           text[] not null default '{}',
  is_promoted             boolean not null default false,
  promoted_from_warrior_id uuid references warriors(id),
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table warrior_equipment (
  id           uuid primary key default uuid_generate_v4(),
  warrior_id   uuid not null references warriors(id) on delete cascade,
  equipment_id uuid not null references equipment(id),
  quantity     integer not null default 1,
  cost_paid    integer not null default 0,
  acquired_at  timestamptz not null default now()
);

create table warrior_injuries (
  id                  uuid primary key default uuid_generate_v4(),
  warrior_id          uuid not null references warriors(id) on delete cascade,
  injury_name         text not null,
  d66_result          text not null,
  effect_type         injury_effect not null,
  effect_description  text not null,
  mod_move            integer,
  mod_weapon_skill    integer,
  mod_ballistic_skill integer,
  mod_strength        integer,
  mod_toughness       integer,
  mod_wounds          integer,
  mod_initiative      integer,
  mod_attacks         integer,
  mod_leadership      integer,
  battle_id           uuid, -- FK added after battles table
  recorded_at         timestamptz not null default now()
);

create table warrior_advances (
  id                    uuid primary key default uuid_generate_v4(),
  warrior_id            uuid not null references warriors(id) on delete cascade,
  advance_number        integer not null,
  roll_result           text not null,
  advance_type          advance_type not null,
  stat_increased        text,
  stat_increase_amount  integer,
  skill_gained          text,
  battle_id             uuid,
  recorded_at           timestamptz not null default now()
);

-- ── PRD-004: Campaigns ───────────────────────────────────────────────────────

create table campaigns (
  id                        uuid primary key default uuid_generate_v4(),
  commissioner_id           uuid not null references profiles(id),
  name                      text not null,
  slug                      text not null unique,
  mode                      campaign_mode not null default 'standard',
  status                    campaign_status not null default 'draft',
  privacy                   campaign_privacy not null default 'public',
  description               text,
  location                  text,
  -- Rules config
  ruleset                   text not null default 'core',
  starting_gold             integer not null default 500,
  starting_xp_bonus         integer not null default 0,
  max_warband_size          integer not null default 15,
  max_warbands              integer not null default 12,
  -- Feature flags
  hired_swords_enabled      boolean not null default true,
  dramatis_personae_enabled boolean not null default true,
  magic_items_setting       magic_items_setting not null default 'core',
  alignment_rules_enabled   boolean not null default false,
  -- Session config
  total_sessions            integer, -- null = open-ended
  pairing_method            pairing_method not null default 'commissioner',
  current_session           integer not null default 0,
  -- Scoring
  points_win                integer not null default 3,
  points_draw               integer not null default 1,
  points_loss               integer not null default 0,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- Add FK from warbands to campaigns now that campaigns exists
alter table warbands
  add constraint warbands_campaign_id_fkey
  foreign key (campaign_id) references campaigns(id);

create table campaign_players (
  id               uuid primary key default uuid_generate_v4(),
  campaign_id      uuid not null references campaigns(id) on delete cascade,
  player_id        uuid not null references profiles(id),
  warband_id       uuid not null references warbands(id),
  is_commissioner  boolean not null default false,
  approval_status  approval_status not null default 'pending',
  joined_at        timestamptz not null default now(),
  unique (campaign_id, player_id),
  unique (campaign_id, warband_id)
);

create table sessions (
  id             uuid primary key default uuid_generate_v4(),
  campaign_id    uuid not null references campaigns(id) on delete cascade,
  session_number integer not null,
  status         session_status not null default 'pending',
  opened_at      timestamptz,
  closed_at      timestamptz,
  notes          text,
  created_at     timestamptz not null default now(),
  unique (campaign_id, session_number)
);

-- ── PRD-004 / PRD-005: Scenarios ─────────────────────────────────────────────

create table scenarios (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  ruleset             text not null default 'core',
  special_rules       text,
  attacker_defender   boolean not null default false,
  description         text,
  sort_order          integer not null default 0
);

-- ── PRD-005: Battles ─────────────────────────────────────────────────────────

create table battles (
  id                        uuid primary key default uuid_generate_v4(),
  session_id                uuid not null references sessions(id) on delete cascade,
  campaign_id               uuid not null references campaigns(id),
  scenario_id               uuid references scenarios(id),
  warband_a_id              uuid not null references warbands(id),
  warband_b_id              uuid not null references warbands(id),
  -- Results (null until submitted)
  result_a                  battle_result_type,
  result_b                  battle_result_type,
  warband_a_routed          boolean not null default false,
  warband_b_routed          boolean not null default false,
  wyrdstone_a               integer not null default 0,
  wyrdstone_b               integer not null default 0,
  submitted_by              uuid references profiles(id),
  confirmed_by              uuid references profiles(id),
  commissioner_override     boolean not null default false,
  post_battle_complete_a    boolean not null default false,
  post_battle_complete_b    boolean not null default false,
  notes                     text,
  played_at                 timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create table battle_warrior_results (
  id               uuid primary key default uuid_generate_v4(),
  battle_id        uuid not null references battles(id) on delete cascade,
  warrior_id       uuid not null references warriors(id),
  warband_id       uuid not null references warbands(id),
  went_out_of_action boolean not null default false,
  was_captured     boolean not null default false,
  was_killed       boolean not null default false,
  xp_earned        integer not null default 0,
  injuries_rolled  boolean not null default false,
  unique (battle_id, warrior_id)
);

-- Add FK from warrior_injuries to battles now that battles exists
alter table warrior_injuries
  add constraint warrior_injuries_battle_id_fkey
  foreign key (battle_id) references battles(id);

alter table warrior_advances
  add constraint warrior_advances_battle_id_fkey
  foreign key (battle_id) references battles(id);

-- ── PRD-007: Territories ─────────────────────────────────────────────────────

create table territories (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  income_bonus   integer not null default 0,
  special_rules  text,
  description    text
);

create table warband_territories (
  id             uuid primary key default uuid_generate_v4(),
  warband_id     uuid not null references warbands(id) on delete cascade,
  territory_id   uuid not null references territories(id),
  campaign_id    uuid not null references campaigns(id),
  acquired_via   text, -- 'exploration' | 'battle_reward' | 'commissioner'
  acquired_at    timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index idx_warbands_owner on warbands(owner_id);
create index idx_warbands_campaign on warbands(campaign_id);
create index idx_warriors_warband on warriors(warband_id);
create index idx_warrior_equipment_warrior on warrior_equipment(warrior_id);
create index idx_warrior_injuries_warrior on warrior_injuries(warrior_id);
create index idx_warrior_advances_warrior on warrior_advances(warrior_id);
create index idx_campaign_players_campaign on campaign_players(campaign_id);
create index idx_campaign_players_player on campaign_players(player_id);
create index idx_sessions_campaign on sessions(campaign_id);
create index idx_battles_session on battles(session_id);
create index idx_battles_campaign on battles(campaign_id);
create index idx_battle_warrior_results_battle on battle_warrior_results(battle_id);
create index idx_battle_warrior_results_warrior on battle_warrior_results(warrior_id);
create index idx_warband_territories_warband on warband_territories(warband_id);
create index idx_faction_positions_faction on faction_positions(faction_id);

-- ── Updated_at trigger ────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_warbands_updated_at
  before update on warbands
  for each row execute function set_updated_at();

create trigger set_warriors_updated_at
  before update on warriors
  for each row execute function set_updated_at();

create trigger set_campaigns_updated_at
  before update on campaigns
  for each row execute function set_updated_at();

create trigger set_battles_updated_at
  before update on battles
  for each row execute function set_updated_at();

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();
