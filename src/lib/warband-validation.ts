// Warband validation per PRD-002 §4
import { type HeroEntry, type HenchmanEntry } from '@/store/warband-builder'

export interface ValidationIssue {
  type: 'error' | 'warning'
  rule: string
  message: string
}

interface ValidateOptions {
  heroes: HeroEntry[]
  henchmen: HenchmanEntry[]
  startingGold: number
  goldSpent: number
  totalModels: number
  factionMaxSize: number
}

export function validateWarband(opts: ValidateOptions): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { heroes, henchmen, startingGold, goldSpent, totalModels, factionMaxSize } = opts

  // ── Errors ─────────────────────────────────────────────────────────────────

  // Must have exactly 1 Leader
  const leaders = heroes.filter((h) => h.position.is_leader)
  if (leaders.length === 0) {
    issues.push({
      type: 'error',
      rule: 'leader_required',
      message: 'You must hire a Leader to lead your warband.',
    })
  } else if (leaders.length > 1) {
    issues.push({
      type: 'error',
      rule: 'leader_required',
      message: 'You can only have one Leader.',
    })
  }

  // Minimum 3 models
  if (totalModels < 3) {
    issues.push({
      type: 'error',
      rule: 'min_models',
      message: `Your warband must have at least 3 models to enter Mordheim. (Currently ${totalModels})`,
    })
  }

  // Maximum warband size
  if (totalModels > factionMaxSize) {
    issues.push({
      type: 'error',
      rule: 'max_models',
      message: `Your warband cannot exceed ${factionMaxSize} models. (Currently ${totalModels})`,
    })
  }

  // Hero type max count
  const positionCounts: Record<string, number> = {}
  for (const hero of heroes) {
    positionCounts[hero.positionId] = (positionCounts[hero.positionId] ?? 0) + 1
  }
  for (const hero of heroes) {
    const count = positionCounts[hero.positionId] ?? 0
    if (count > hero.position.max_count) {
      issues.push({
        type: 'error',
        rule: 'hero_max',
        message: `${hero.position.name} can only have ${hero.position.max_count} per warband. (You have ${count})`,
      })
    }
  }

  // Gold overspent
  if (goldSpent > startingGold) {
    issues.push({
      type: 'error',
      rule: 'gold_overspent',
      message: `You have exceeded your starting gold allowance by ${goldSpent - startingGold} gc.`,
    })
  }

  // ── Warnings ───────────────────────────────────────────────────────────────

  // Warriors with no weapons
  const WEAPON_CATEGORIES = new Set(['hand_weapon', 'two_handed', 'missile'])

  for (const hero of heroes) {
    const hasWeapon = hero.equipment.some((e) => WEAPON_CATEGORIES.has(e.item.category))
    if (!hasWeapon) {
      const name = hero.name || hero.position.name
      issues.push({
        type: 'warning',
        rule: 'no_weapon',
        message: `${name} has no weapons and will fight unarmed.`,
      })
    }
  }

  for (const group of henchmen) {
    const hasWeapon = group.equipment.some((e) => WEAPON_CATEGORIES.has(e.item.category))
    if (!hasWeapon) {
      issues.push({
        type: 'warning',
        rule: 'no_weapon',
        message: `${group.position.name} group has no weapons and will fight unarmed.`,
      })
    }
  }

  return issues
}

export function hasErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.type === 'error')
}
