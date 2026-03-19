'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TerritoryCard } from './territory-card'
import { type Territory, type WarbandTerritory } from '@/types/database'
import { formulaLabel } from '@/lib/game-rules/territory-income'

type TerritoryWithHolding = Territory & { holding: WarbandTerritory }

interface WarbandTerritoriesProps {
  warbandId: string
  campaignId: string | null
  isOwner: boolean
  isCommissioner: boolean
}

export function WarbandTerritories({ warbandId, campaignId, isOwner, isCommissioner }: WarbandTerritoriesProps) {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)

  const { data: territories = [], isLoading } = useQuery({
    queryKey: ['warband-territories', warbandId],
    queryFn: async (): Promise<TerritoryWithHolding[]> => {
      const res = await fetch(`/api/warbands/${warbandId}/territories`)
      if (!res.ok) throw new Error('Failed to load territories')
      return res.json()
    },
  })

  const { data: available = [] } = useQuery({
    queryKey: ['territories-all'],
    queryFn: async (): Promise<Territory[]> => {
      const res = await fetch('/api/territories')
      if (!res.ok) throw new Error('Failed to load territories')
      return res.json()
    },
    enabled: isCommissioner && showAdd,
  })

  const removeMutation = useMutation({
    mutationFn: async (holdingId: string) => {
      const res = await fetch(`/api/warbands/${warbandId}/territories/${holdingId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove territory')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warband-territories', warbandId] })
      toast.success('Territory removed')
    },
    onError: () => toast.error('Failed to remove territory'),
  })

  const addMutation = useMutation({
    mutationFn: async ({ territoryId }: { territoryId: string }) => {
      const res = await fetch(`/api/warbands/${warbandId}/territories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ territoryId, campaignId, acquiredVia: 'commissioner' }),
      })
      if (!res.ok) throw new Error('Failed to award territory')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warband-territories', warbandId] })
      setShowAdd(false)
      toast.success('Territory awarded')
    },
    onError: () => toast.error('Failed to award territory'),
  })

  const totalIncome = territories
    .map((t): number | null => {
      const label = formulaLabel(t.income_formula ?? 'none')
      return label === 'No income' ? 0 : null // can't sum dice-based income
    })
    .filter((v): v is number => v !== null)
    .reduce((a, b) => a + b, 0)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 rounded-md bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Territories</p>
          {territories.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {territories.length} controlled
            </p>
          )}
        </div>
        {isCommissioner && (
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs px-2.5 py-1 rounded border border-border text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors"
          >
            {showAdd ? 'Cancel' : '+ Award Territory'}
          </button>
        )}
      </div>

      {/* Add territory dropdown */}
      {showAdd && isCommissioner && (
        <div className="rounded border border-gold/20 bg-gold/5 p-3 space-y-2">
          <p className="text-xs text-muted-foreground">Select a territory to award:</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {available.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => addMutation.mutate({ territoryId: t.id })}
                disabled={addMutation.isPending}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded border border-border hover:border-gold/30 text-sm transition-colors"
              >
                <span className="text-foreground">{t.name}</span>
                <span className="text-xs text-gold">{formulaLabel(t.income_formula ?? 'none')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Territory list */}
      {territories.length === 0 ? (
        <p className="text-sm text-muted-foreground/60 py-2">No territories controlled.</p>
      ) : (
        <div className="space-y-1.5">
          {territories.map((t) => (
            <TerritoryCard
              key={t.holding.id}
              territory={t}
              holding={t.holding}
              compact
              onRemove={isCommissioner ? () => removeMutation.mutate(t.holding.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
