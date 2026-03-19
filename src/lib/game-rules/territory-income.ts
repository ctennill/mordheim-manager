// Territory income formula parser per PRD-007

export interface IncomeRoll {
  formula: string
  dice: number[]   // individual die results
  total: number
  description: string
}

/**
 * Parse and evaluate a territory income formula.
 * Formula syntax: 'nD6*m', '2D6*5', 'D3*10', 'flat:N', 'none'
 */
export function rollTerritoryIncome(formula: string): IncomeRoll {
  if (formula === 'none' || !formula) {
    return { formula, dice: [], total: 0, description: 'No income' }
  }

  // flat:N
  if (formula.startsWith('flat:')) {
    const n = parseInt(formula.slice(5))
    return { formula, dice: [], total: n, description: `${n} gc (flat)` }
  }

  // nDm*k  e.g. "2D6*5", "D6*5", "D3*10"
  const match = formula.match(/^(\d*)D(\d+)(?:\*(\d+))?$/)
  if (!match) {
    return { formula, dice: [], total: 0, description: 'Unknown formula' }
  }

  const count = parseInt(match[1] || '1')
  const sides = parseInt(match[2])
  const multiplier = match[3] ? parseInt(match[3]) : 1

  const dice: number[] = []
  for (let i = 0; i < count; i++) {
    dice.push(Math.ceil(Math.random() * sides))
  }

  const sum = dice.reduce((a, b) => a + b, 0)
  const total = sum * multiplier

  const diceExpr = dice.length === 1 ? `${dice[0]}` : `(${dice.join('+')}=${sum})`
  const multExpr = multiplier > 1 ? `×${multiplier}` : ''
  const description = `${count > 1 ? count : ''}D${sides}${multExpr}: ${diceExpr}${multiplier > 1 ? ` = ${total} gc` : ` gc`}`

  return { formula, dice, total, description }
}

/** Human-readable label for a formula, e.g. "D6×5 gc" */
export function formulaLabel(formula: string): string {
  if (formula === 'none' || !formula) return 'No income'
  if (formula.startsWith('flat:')) return `${formula.slice(5)} gc`
  const match = formula.match(/^(\d*)D(\d+)(?:\*(\d+))?$/)
  if (!match) return formula
  const count = match[1] ? match[1] : ''
  const sides = match[2]
  const mult = match[3] ? `×${match[3]} gc` : ' gc'
  return `${count}D${sides}${mult}`
}
