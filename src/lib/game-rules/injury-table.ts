// Serious Injury Table per PRD-003 Section 6.1 (D66 results)
// D66: roll two D6, first die = tens, second die = units

import { type InjuryEffect } from '@/types/database'

export interface InjuryResult {
  d66: string
  name: string
  effect: InjuryEffect
  description: string
  statMod?: Partial<{
    move: number
    weapon_skill: number
    ballistic_skill: number
    strength: number
    toughness: number
    wounds: number
    initiative: number
    attacks: number
    leadership: number
  }>
}

export const SERIOUS_INJURY_TABLE: InjuryResult[] = [
  // 11–15: Lightly Wounded
  { d66: '11', name: 'Lightly Wounded', effect: 'none', description: 'No lasting effect.' },
  { d66: '12', name: 'Lightly Wounded', effect: 'none', description: 'No lasting effect.' },
  { d66: '13', name: 'Lightly Wounded', effect: 'none', description: 'No lasting effect.' },
  { d66: '14', name: 'Lightly Wounded', effect: 'none', description: 'No lasting effect.' },
  { d66: '15', name: 'Lightly Wounded', effect: 'none', description: 'No lasting effect.' },
  { d66: '16', name: 'Deep Wound', effect: 'miss_next_battle', description: 'The warrior misses the next battle.' },
  { d66: '21', name: 'Bitter Enmity', effect: 'special', description: 'The warrior gains Hatred against a randomly determined enemy warband.' },
  { d66: '22', name: 'Captured', effect: 'captured', description: 'The warrior is taken prisoner by the enemy warband.' },
  { d66: '23', name: 'Hardened', effect: 'none', description: 'The warrior becomes immune to Fear.' },
  { d66: '24', name: 'Robbery', effect: 'equipment_loss', description: 'The warrior loses all their equipment.' },
  { d66: '25', name: 'Sold to the Pits', effect: 'special', description: 'Roll a D6. On a 1–3 the warrior is killed. On a 4–6 they escape and return.' },
  { d66: '26', name: 'Worsening Old Battle Wound', effect: 'stat_modifier', description: '-1 Toughness, permanent.', statMod: { toughness: -1 } },
  { d66: '31', name: 'Captured', effect: 'captured', description: 'The warrior is taken prisoner by the enemy warband.' },
  { d66: '32', name: 'Amnesia', effect: 'skill_loss', description: 'The warrior loses one randomly determined skill.' },
  { d66: '33', name: 'Bone Splinter', effect: 'stat_modifier', description: '-1 Ballistic Skill, permanent.', statMod: { ballistic_skill: -1 } },
  { d66: '34', name: 'Smashed Leg', effect: 'stat_modifier', description: '-1 Movement, permanent.', statMod: { move: -1 } },
  { d66: '35', name: 'Chest Wound', effect: 'stat_modifier', description: '-1 Toughness, permanent.', statMod: { toughness: -1 } },
  { d66: '36', name: 'Blinded in One Eye', effect: 'stat_modifier', description: '-1 Ballistic Skill, permanent.', statMod: { ballistic_skill: -1 } },
  { d66: '41', name: 'Deep Wound', effect: 'miss_next_battle', description: 'The warrior misses the next battle.' },
  { d66: '42', name: 'Full Recovery', effect: 'none', description: 'No lasting effect.' },
  { d66: '43', name: 'Full Recovery', effect: 'none', description: 'No lasting effect.' },
  { d66: '44', name: 'Nervous Condition', effect: 'stat_modifier', description: '-1 Initiative, permanent.', statMod: { initiative: -1 } },
  { d66: '45', name: 'Hand Injury', effect: 'stat_modifier', description: '-1 Weapon Skill, permanent.', statMod: { weapon_skill: -1 } },
  { d66: '46', name: 'Multiple Injuries', effect: 'special', description: 'Roll D6 times on this table (ignore further Multiple Injuries results).' },
  // 51–52: Head Wound
  { d66: '51', name: 'Head Wound', effect: 'stat_modifier', description: '-1 Initiative, +1 Leadership.', statMod: { initiative: -1, leadership: 1 } },
  { d66: '52', name: 'Head Wound', effect: 'stat_modifier', description: '-1 Initiative, +1 Leadership.', statMod: { initiative: -1, leadership: 1 } },
  // 53–54: Robbed
  { d66: '53', name: 'Robbed', effect: 'gold_loss', description: 'Lose D6×5 gold crowns from the warband treasury.' },
  { d66: '54', name: 'Robbed', effect: 'gold_loss', description: 'Lose D6×5 gold crowns from the warband treasury.' },
  { d66: '55', name: 'Crushing Blow', effect: 'stat_modifier', description: '-1 Attack, permanent.', statMod: { attacks: -1 } },
  { d66: '56', name: 'Severe Head Wound', effect: 'stat_modifier', description: '-1 Leadership, permanent.', statMod: { leadership: -1 } },
  // 61–65: Dead
  { d66: '61', name: 'Dead', effect: 'dead', description: 'The warrior has been slain. Remove from warband.' },
  { d66: '62', name: 'Dead', effect: 'dead', description: 'The warrior has been slain. Remove from warband.' },
  { d66: '63', name: 'Dead', effect: 'dead', description: 'The warrior has been slain. Remove from warband.' },
  { d66: '64', name: 'Dead', effect: 'dead', description: 'The warrior has been slain. Remove from warband.' },
  { d66: '65', name: 'Dead', effect: 'dead', description: 'The warrior has been slain. Remove from warband.' },
  { d66: '66', name: 'Totally Recovered', effect: 'none', description: 'No lasting effect.' },
]

export function getInjuryResult(d66: string): InjuryResult | undefined {
  return SERIOUS_INJURY_TABLE.find(r => r.d66 === d66)
}

export function rollD66(): string {
  const tens = Math.ceil(Math.random() * 6)
  const units = Math.ceil(Math.random() * 6)
  return `${tens}${units}`
}
