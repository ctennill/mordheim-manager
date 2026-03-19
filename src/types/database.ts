// Auto-generated types will eventually come from `supabase gen types typescript`
// This file provides manual types until that's configured.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ─── Enums ───────────────────────────────────────────────────────────────────

export type WarriorType = 'hero' | 'henchman'
export type WarriorStatus = 'active' | 'recovering' | 'captured' | 'dead' | 'retired'
export type CampaignMode = 'standard' | 'open' | 'event' | 'solo'
export type CampaignStatus = 'draft' | 'registration' | 'active' | 'completed' | 'archived'
export type CampaignPrivacy = 'public' | 'private' | 'unlisted'
export type BattleResultType = 'win' | 'loss' | 'draw'
export type PairingMethod = 'commissioner' | 'swiss' | 'round_robin' | 'random'
export type EquipmentCategory = 'hand_weapon' | 'two_handed' | 'missile' | 'armor' | 'helmet' | 'shield' | 'miscellaneous' | 'magic'
export type FactionType = 'official' | 'supplement' | 'custom'
export type SessionStatus = 'pending' | 'active' | 'closed'
export type WarbandStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'active'
export type InjuryEffect = 'none' | 'miss_next_battle' | 'stat_modifier' | 'skill_loss' | 'equipment_loss' | 'gold_loss' | 'captured' | 'dead' | 'special'

// ─── Database Tables ──────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      factions: {
        Row: Faction
        Insert: Omit<Faction, 'id' | 'created_at'>
        Update: Partial<Omit<Faction, 'id' | 'created_at'>>
      }
      faction_positions: {
        Row: FactionPosition
        Insert: Omit<FactionPosition, 'id'>
        Update: Partial<Omit<FactionPosition, 'id'>>
      }
      equipment: {
        Row: Equipment
        Insert: Omit<Equipment, 'id'>
        Update: Partial<Omit<Equipment, 'id'>>
      }
      faction_equipment: {
        Row: FactionEquipment
        Insert: FactionEquipment
        Update: Partial<FactionEquipment>
      }
      warbands: {
        Row: Warband
        Insert: Omit<Warband, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Warband, 'id' | 'created_at'>>
      }
      warriors: {
        Row: Warrior
        Insert: Omit<Warrior, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Warrior, 'id' | 'created_at'>>
      }
      warrior_equipment: {
        Row: WarriorEquipment
        Insert: Omit<WarriorEquipment, 'id' | 'acquired_at'>
        Update: Partial<Omit<WarriorEquipment, 'id'>>
      }
      warrior_injuries: {
        Row: WarriorInjury
        Insert: Omit<WarriorInjury, 'id' | 'recorded_at'>
        Update: Partial<Omit<WarriorInjury, 'id'>>
      }
      warrior_advances: {
        Row: WarriorAdvance
        Insert: Omit<WarriorAdvance, 'id' | 'recorded_at'>
        Update: Partial<Omit<WarriorAdvance, 'id'>>
      }
      campaigns: {
        Row: Campaign
        Insert: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Campaign, 'id' | 'created_at'>>
      }
      campaign_players: {
        Row: CampaignPlayer
        Insert: Omit<CampaignPlayer, 'id' | 'joined_at'>
        Update: Partial<Omit<CampaignPlayer, 'id'>>
      }
      sessions: {
        Row: Session
        Insert: Omit<Session, 'id' | 'created_at'>
        Update: Partial<Omit<Session, 'id' | 'created_at'>>
      }
      battles: {
        Row: Battle
        Insert: Omit<Battle, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Battle, 'id' | 'created_at'>>
      }
      battle_warrior_results: {
        Row: BattleWarriorResult
        Insert: Omit<BattleWarriorResult, 'id'>
        Update: Partial<Omit<BattleWarriorResult, 'id'>>
      }
      scenarios: {
        Row: Scenario
        Insert: Omit<Scenario, 'id'>
        Update: Partial<Omit<Scenario, 'id'>>
      }
      territories: {
        Row: Territory
        Insert: Omit<Territory, 'id'>
        Update: Partial<Omit<Territory, 'id'>>
      }
      warband_territories: {
        Row: WarbandTerritory
        Insert: Omit<WarbandTerritory, 'id' | 'acquired_at'>
        Update: Partial<Omit<WarbandTerritory, 'id'>>
      }
    }
  }
}

// ─── Row Types ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string // matches auth.users.id
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Faction {
  id: string
  name: string
  type: FactionType
  ruleset: string // 'core' | 'town_cryer' | 'community'
  lore: string | null
  special_rules: string[] // JSON array of rule strings
  starting_gold: number
  min_warband_size: number
  max_warband_size: number
  alignment: string | null // 'law' | 'neutral' | 'chaos'
  is_enabled: boolean
  created_at: string
}

export interface FactionPosition {
  id: string
  faction_id: string
  name: string
  warrior_type: WarriorType
  is_leader: boolean
  min_count: number
  max_count: number
  // Base stats
  move: number
  weapon_skill: number
  ballistic_skill: number
  strength: number
  toughness: number
  wounds: number
  initiative: number
  attacks: number
  leadership: number
  // Skill lists available (comma-separated or JSON)
  primary_skills: string[]
  secondary_skills: string[]
  special_rules: string[]
  cost: number
  sort_order: number
}

export interface Equipment {
  id: string
  name: string
  category: EquipmentCategory
  cost: number
  // Stat modifiers (null = no modifier)
  mod_move: number | null
  mod_weapon_skill: number | null
  mod_ballistic_skill: number | null
  mod_strength: number | null
  mod_toughness: number | null
  mod_wounds: number | null
  mod_initiative: number | null
  mod_attacks: number | null
  mod_leadership: number | null
  // Special
  special_rules: string[]
  rarity: number // 0 = common, 1–6 = availability roll required
  max_per_warrior: number
  is_magic: boolean
  description: string | null
}

export interface FactionEquipment {
  faction_id: string
  equipment_id: string
  is_faction_specific: boolean
}

export interface Warband {
  id: string
  owner_id: string // profiles.id
  faction_id: string
  campaign_id: string | null
  name: string
  motto: string | null
  background: string | null
  status: WarbandStatus
  treasury: number
  warband_rating: number
  wins: number
  losses: number
  draws: number
  created_at: string
  updated_at: string
}

export interface Warrior {
  id: string
  warband_id: string
  faction_position_id: string
  name: string | null // null for unnamed henchman groups
  warrior_type: WarriorType
  status: WarriorStatus
  group_count: number // 1 for heroes, N for henchman groups
  experience: number
  advancements_taken: number
  // Current stats (base + all modifiers applied)
  move: number
  weapon_skill: number
  ballistic_skill: number
  strength: number
  toughness: number
  wounds: number
  initiative: number
  attacks: number
  leadership: number
  // Base stats (from faction_position at creation)
  base_move: number
  base_weapon_skill: number
  base_ballistic_skill: number
  base_strength: number
  base_toughness: number
  base_wounds: number
  base_initiative: number
  base_attacks: number
  base_leadership: number
  // Special
  skills: string[] // acquired skill names
  special_rules: string[]
  is_promoted: boolean // henchman promoted to hero
  promoted_from_warrior_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WarriorEquipment {
  id: string
  warrior_id: string
  equipment_id: string
  quantity: number
  acquired_at: string
  cost_paid: number
}

export interface WarriorInjury {
  id: string
  warrior_id: string
  injury_name: string
  d66_result: string // e.g. "34"
  effect_type: InjuryEffect
  effect_description: string
  // Stat modifiers from injury
  mod_move: number | null
  mod_weapon_skill: number | null
  mod_ballistic_skill: number | null
  mod_strength: number | null
  mod_toughness: number | null
  mod_wounds: number | null
  mod_initiative: number | null
  mod_attacks: number | null
  mod_leadership: number | null
  battle_id: string | null
  recorded_at: string
}

export interface WarriorAdvance {
  id: string
  warrior_id: string
  advance_number: number
  roll_result: string // e.g. "7" for 2d6 result
  advance_type: 'stat' | 'skill' | 'double' | 'lads_got_talent'
  stat_increased: string | null // e.g. 'weapon_skill'
  stat_increase_amount: number | null
  skill_gained: string | null
  battle_id: string | null
  recorded_at: string
}

export interface Campaign {
  id: string
  commissioner_id: string // profiles.id
  name: string
  slug: string // URL-safe unique identifier
  mode: CampaignMode
  status: CampaignStatus
  privacy: CampaignPrivacy
  description: string | null
  location: string | null
  // Rules config
  ruleset: string
  starting_gold: number
  starting_xp_bonus: number
  max_warband_size: number
  max_warbands: number
  // Feature flags
  hired_swords_enabled: boolean
  dramatis_personae_enabled: boolean
  magic_items_setting: 'core' | 'all' | 'disabled'
  alignment_rules_enabled: boolean
  // Faction availability (from migration 004)
  allowed_faction_ids: string[] | null // null = all allowed
  // Session config
  total_sessions: number | null // null = open-ended
  pairing_method: PairingMethod
  current_session: number
  // Scoring
  points_win: number
  points_draw: number
  points_loss: number
  // Meta
  created_at: string
  updated_at: string
}

export interface CampaignPlayer {
  id: string
  campaign_id: string
  player_id: string // profiles.id
  warband_id: string
  is_commissioner: boolean
  joined_at: string
  approval_status: 'pending' | 'approved' | 'rejected'
}

export interface Session {
  id: string
  campaign_id: string
  session_number: number
  status: SessionStatus
  opened_at: string | null
  closed_at: string | null
  notes: string | null
  created_at: string
}

export interface Battle {
  id: string
  session_id: string
  campaign_id: string
  scenario_id: string | null
  warband_a_id: string
  warband_b_id: string
  // Result (null until submitted)
  result_a: BattleResultType | null
  result_b: BattleResultType | null
  warband_a_routed: boolean
  warband_b_routed: boolean
  // Wyrdstone / objectives
  wyrdstone_a: number
  wyrdstone_b: number
  submitted_by: string | null
  confirmed_by: string | null
  commissioner_override: boolean
  post_battle_complete_a: boolean
  post_battle_complete_b: boolean
  notes: string | null
  played_at: string | null
  created_at: string
  updated_at: string
}

export interface BattleWarriorResult {
  id: string
  battle_id: string
  warrior_id: string
  warband_id: string
  went_out_of_action: boolean
  was_captured: boolean
  was_killed: boolean
  xp_earned: number
  injuries_rolled: boolean
}

export interface Scenario {
  id: string
  name: string
  ruleset: string
  special_rules: string | null
  attacker_defender: boolean // true if has attacker/defender roles
  description: string | null
  sort_order: number
}

export interface Territory {
  id: string
  name: string
  income_bonus: number
  special_rules: string | null
  description: string | null
}

export interface WarbandTerritory {
  id: string
  warband_id: string
  territory_id: string
  campaign_id: string
  acquired_at: string
  acquired_via: string | null // 'exploration' | 'battle_reward' | 'commissioner'
}
