// Warband Rating calculation per PRD-002 Section 3.5
// WR = (sum of all warrior XP) + (5 × number of warriors)

import { type Warrior } from '@/types/database'

export function calculateWarbandRating(warriors: Warrior[], treasury: number): {
  total: number
  fromXP: number
  fromWarriors: number
  fromTreasury: number
} {
  const activeWarriors = warriors.filter(w => w.status === 'active' || w.status === 'recovering')

  const warriorCount = activeWarriors.reduce((sum, w) => sum + w.group_count, 0)
  const totalXP = activeWarriors.reduce((sum, w) => sum + w.experience, 0)
  const fromTreasury = Math.floor(treasury / 5)

  const fromXP = totalXP
  const fromWarriors = warriorCount * 5

  return {
    total: fromXP + fromWarriors + fromTreasury,
    fromXP,
    fromWarriors,
    fromTreasury,
  }
}
