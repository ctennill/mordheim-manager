'use client'

import { useWarbandBuilder } from '@/store/warband-builder'

export function GoldTracker() {
  const startingGold = useWarbandBuilder((s) => s.startingGold)
  const heroesCost = useWarbandBuilder((s) => s.heroesCost())
  const henchmenCost = useWarbandBuilder((s) => s.henchmenCost())
  const equipmentCost = useWarbandBuilder((s) => s.equipmentCost())
  const goldSpent = heroesCost + henchmenCost + equipmentCost
  const goldRemaining = startingGold - goldSpent

  const colorClass =
    goldRemaining < 0
      ? 'text-red-400'
      : goldRemaining < 10
      ? 'text-amber-400'
      : 'text-gold'

  return (
    <div className="flex items-center gap-6 text-sm">
      {/* Breakdown */}
      <div className="hidden sm:flex items-center gap-4 text-muted-foreground">
        {heroesCost > 0 && <span>Heroes: {heroesCost} gc</span>}
        {henchmenCost > 0 && <span>Henchmen: {henchmenCost} gc</span>}
        {equipmentCost > 0 && <span>Equip: {equipmentCost} gc</span>}
      </div>

      {/* Remaining — always visible */}
      <div className={`font-bold tabular-nums text-base ${colorClass}`}>
        {goldRemaining >= 0 ? (
          <span>{goldRemaining} gc remaining</span>
        ) : (
          <span>−{Math.abs(goldRemaining)} gc over budget!</span>
        )}
      </div>
    </div>
  )
}
