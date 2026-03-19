// XP advancement thresholds per PRD-003 Section 5

export const HERO_XP_THRESHOLDS = [2, 4, 6, 8, 11, 14, 17, 20, 24, 28, 32]
export const HENCHMAN_XP_THRESHOLDS = [4, 8, 12] // then +4 each subsequent

export function getHeroAdvancementCount(xp: number): number {
  let count = 0
  for (const threshold of HERO_XP_THRESHOLDS) {
    if (xp >= threshold) count++
    else break
  }
  // Beyond the table: every 4 XP after 32
  if (xp >= 32) {
    count += Math.floor((xp - 32) / 4)
  }
  return count
}

export function getHenchmanAdvancementCount(xp: number): number {
  let count = 0
  for (const threshold of HENCHMAN_XP_THRESHOLDS) {
    if (xp >= threshold) count++
    else break
  }
  // Beyond the table: every 4 XP after 12
  if (xp >= 12) {
    const extra = Math.floor((xp - 12) / 4)
    count += extra
  }
  return count
}

export function getNextHeroThreshold(xp: number): number | null {
  for (const threshold of HERO_XP_THRESHOLDS) {
    if (xp < threshold) return threshold
  }
  // Beyond table: next multiple of 4 after 32
  const base = Math.max(32, xp)
  return base + (4 - ((base - 32) % 4))
}

export function getNextHenchmanThreshold(xp: number): number | null {
  for (const threshold of HENCHMAN_XP_THRESHOLDS) {
    if (xp < threshold) return threshold
  }
  const base = Math.max(12, xp)
  return base + (4 - ((base - 12) % 4))
}

export function hasPendingAdvancement(
  xp: number,
  advancementsTaken: number,
  isHero: boolean
): boolean {
  const earned = isHero
    ? getHeroAdvancementCount(xp)
    : getHenchmanAdvancementCount(xp)
  return earned > advancementsTaken
}
