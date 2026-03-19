// Hero Advancement Table per PRD-003 Section 5.4
// Roll 2D6

export type AdvanceType = 'new_skill' | 'stat_increase' | 'double_roll' | 'lads_got_talent'

export interface AdvancementOption {
  roll: number // 2d6 result
  description: string
  type: AdvanceType
  statOptions?: string[] // e.g. ['wounds', 'attacks'] — player chooses one
  stat?: string // single stat if no choice
  amount?: number
}

export const HERO_ADVANCEMENT_TABLE: AdvancementOption[] = [
  {
    roll: 2,
    description: 'Roll twice on this table, re-rolling further 2s',
    type: 'double_roll',
  },
  {
    roll: 3,
    description: 'New Skill (choose from primary or secondary skill list)',
    type: 'new_skill',
  },
  {
    roll: 4,
    description: 'New Skill (choose from primary or secondary skill list)',
    type: 'new_skill',
  },
  {
    roll: 5,
    description: '+1 Initiative',
    type: 'stat_increase',
    stat: 'initiative',
    amount: 1,
  },
  {
    roll: 6,
    description: '+1 Wound or +1 Attack (choose one)',
    type: 'stat_increase',
    statOptions: ['wounds', 'attacks'],
    amount: 1,
  },
  {
    roll: 7,
    description: '+1 Strength or +1 Toughness (choose one)',
    type: 'stat_increase',
    statOptions: ['strength', 'toughness'],
    amount: 1,
  },
  {
    roll: 8,
    description: '+1 Weapon Skill or +1 Ballistic Skill (choose one)',
    type: 'stat_increase',
    statOptions: ['weapon_skill', 'ballistic_skill'],
    amount: 1,
  },
  {
    roll: 9,
    description: '+1 Initiative',
    type: 'stat_increase',
    stat: 'initiative',
    amount: 1,
  },
  {
    roll: 10,
    description: '+1 Leadership',
    type: 'stat_increase',
    stat: 'leadership',
    amount: 1,
  },
  {
    roll: 11,
    description: 'New Skill',
    type: 'new_skill',
  },
  {
    roll: 12,
    description: "Lad's Got Talent — Heroes re-roll; Henchmen promote to Hero!",
    type: 'lads_got_talent',
  },
]

// Stat caps per Mordheim rules
export const STAT_CAPS: Record<string, number> = {
  move: 9,
  weapon_skill: 7,
  ballistic_skill: 7,
  strength: 6,
  toughness: 6,
  wounds: 4,
  initiative: 9,
  attacks: 4,
  leadership: 10,
}

export function getAdvancementEntry(roll: number): AdvancementOption | undefined {
  return HERO_ADVANCEMENT_TABLE.find(e => e.roll === roll)
}

export function isStatCapped(stat: string, currentValue: number): boolean {
  const cap = STAT_CAPS[stat]
  if (cap === undefined) return false
  return currentValue >= cap
}
