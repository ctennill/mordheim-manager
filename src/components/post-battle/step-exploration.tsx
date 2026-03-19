'use client'

import { usePostBattle } from '@/store/post-battle'
import { getExplorationResult, resolveExplorationGold, rollD6 } from '@/lib/game-rules/exploration-table'

export function StepExploration() {
  const { exploringHeroes, explorationOutcomes, setHeroExplorationRoll, setExplorationOutcomes } = usePostBattle()

  const allRolled = exploringHeroes.length === 0 || exploringHeroes.every((h) => h.dieRoll !== null)
  const total = exploringHeroes.reduce((s, h) => s + (h.dieRoll ?? 0), 0)
  const outcomesResolved = explorationOutcomes.length > 0

  function resolveOutcomes() {
    const result = getExplorationResult(total)
    const { gold, rollDesc } = resolveExplorationGold(result)
    const outcomes = [{ result, goldResolved: gold, rollDesc, isBonus: false }]

    // Handle Catacombs — D3 extra rolls
    if (result.name === 'Catacombs') {
      const extraCount = Math.ceil(Math.random() * 3)
      for (let i = 0; i < extraCount; i++) {
        // Roll on table excluding Catacombs and Nothing
        const extraTotal = Math.floor(Math.random() * 12) + 6 // 6–17
        const extraResult = getExplorationResult(extraTotal)
        const { gold: extraGold, rollDesc: extraDesc } = resolveExplorationGold(extraResult)
        outcomes.push({ result: extraResult, goldResolved: extraGold, rollDesc: extraDesc, isBonus: true })
      }
    }

    setExplorationOutcomes(outcomes)
  }

  if (exploringHeroes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No heroes are eligible to explore this battle.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Each surviving hero rolls 1D6. The combined total determines your exploration result.
      </p>

      {/* Hero roll cards */}
      <div className="space-y-2">
        {exploringHeroes.map((hero) => (
          <div key={hero.warriorId} className="flex items-center justify-between gap-4 rounded border border-border bg-card px-4 py-3">
            <span className="text-sm text-foreground">{hero.warriorName}</span>
            {hero.dieRoll === null ? (
              <button
                type="button"
                onClick={() => setHeroExplorationRoll(hero.warriorId, rollD6())}
                className="px-3 py-1.5 text-sm rounded border border-border text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors"
              >
                Roll D6
              </button>
            ) : (
              <span className="text-2xl font-mono font-bold text-gold">{hero.dieRoll}</span>
            )}
          </div>
        ))}
      </div>

      {/* Total + resolve */}
      {allRolled && (
        <div className="space-y-4">
          <div className="rounded border border-gold/20 bg-gold/5 px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Exploration Total</span>
            <span className="text-3xl font-mono font-bold text-gold">{total}</span>
          </div>

          {!outcomesResolved ? (
            <button
              type="button"
              onClick={resolveOutcomes}
              className="w-full py-2.5 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
            >
              Reveal Exploration Result
            </button>
          ) : (
            <div className="space-y-3">
              {explorationOutcomes.map((outcome, i) => (
                <div
                  key={i}
                  className={`rounded border px-4 py-4 space-y-2 ${
                    outcome.result.outcome === 'nothing'
                      ? 'border-border bg-card'
                      : outcome.result.outcome === 'gold'
                      ? 'border-gold/30 bg-gold/5'
                      : 'border-blue-500/30 bg-blue-500/5'
                  }`}
                >
                  {outcome.isBonus && (
                    <span className="text-xs text-blue-400 uppercase tracking-widest">Catacombs Bonus Roll</span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{outcome.result.name}</span>
                    {outcome.goldResolved > 0 && (
                      <span className="font-mono text-gold font-bold">+{outcome.goldResolved} gc</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{outcome.result.description}</p>
                  {outcome.rollDesc && (
                    <p className="text-xs text-muted-foreground/60">Roll: {outcome.rollDesc}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 italic">{outcome.result.flavor}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
