'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useWarbandBuilder } from '@/store/warband-builder'
import { validateWarband, hasErrors } from '@/lib/warband-validation'
import { type Faction } from '@/types/database'
import { toast } from 'sonner'

export function StepReview() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const store = useWarbandBuilder()
  const {
    factionId, factionName, warbandName, motto, heroes, henchmen,
    startingGold, goldSpent, goldRemaining, totalModels, heroesCost,
    henchmenCost, equipmentCost, reset,
  } = store

  const { data: faction } = useQuery({
    queryKey: ['faction', factionId],
    queryFn: async () => {
      if (!factionId) return null
      const supabase = createClient()
      const { data } = await supabase.from('factions').select('*').eq('id', factionId).single()
      return data as Faction | null
    },
    enabled: !!factionId,
  })

  const issues = validateWarband({
    heroes,
    henchmen,
    startingGold,
    goldSpent: goldSpent(),
    totalModels: totalModels(),
    factionMaxSize: faction?.max_warband_size ?? 15,
  })

  const errors = issues.filter((i) => i.type === 'error')
  const warnings = issues.filter((i) => i.type === 'warning')
  const canSubmit = !hasErrors(issues)

  async function handleSaveDraft() {
    await submitWarband('draft')
  }

  async function submitWarband(status: 'draft' | 'submitted') {
    setSubmitting(true)
    try {
      const res = await fetch('/api/warbands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factionId,
          name: warbandName,
          motto,
          status,
          heroes: heroes.map((h) => ({
            positionId: h.positionId,
            name: h.name,
            equipment: h.equipment.map((e) => ({ id: e.item.id, cost: e.item.cost, quantity: e.quantity })),
          })),
          henchmen: henchmen.map((h) => ({
            positionId: h.positionId,
            count: h.count,
            equipment: h.equipment.map((e) => ({ id: e.item.id, cost: e.item.cost, quantity: e.quantity })),
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to save warband')
      }

      const { warbandId } = await res.json()
      toast.success(status === 'draft' ? 'Warband saved as draft!' : 'Warband submitted!')
      reset()
      router.push(`/warbands/${warbandId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Validation checklist */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Validation
        </h3>
        <div className="rounded-md border border-border bg-card divide-y divide-border">
          <CheckRow
            ok={heroes.some((h) => h.position.is_leader)}
            label="Leader hired"
            errorMsg="No Leader hired"
          />
          <CheckRow
            ok={totalModels() >= 3}
            label={`Minimum 3 models (${totalModels()} hired)`}
            errorMsg={`Only ${totalModels()} model${totalModels() !== 1 ? 's' : ''} — need at least 3`}
          />
          <CheckRow
            ok={totalModels() <= (faction?.max_warband_size ?? 15)}
            label={`Warband size within limit (max ${faction?.max_warband_size ?? 15})`}
            errorMsg={`Too many models (${totalModels()} / ${faction?.max_warband_size ?? 15})`}
          />
          <CheckRow
            ok={goldSpent() <= startingGold}
            label={`Gold within budget (${goldSpent()} / ${startingGold} gc)`}
            errorMsg={`Over budget by ${goldSpent() - startingGold} gc`}
          />
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <span className="text-amber-400 shrink-0 mt-0.5">⚠</span>
              <span className="text-sm text-amber-400/80">{w.message}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Roster summary */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Roster — {warbandName || '(unnamed)'}
        </h3>
        <div className="rounded-md border border-border bg-card overflow-hidden">
          {heroes.map((hero) => (
            <div key={hero.tempId} className="flex justify-between items-start gap-4 px-4 py-2.5 border-b border-border/50 last:border-b-0">
              <div>
                <span className="text-sm font-medium text-foreground">
                  {hero.name || hero.position.name}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5">{hero.position.name}</span>
                {hero.equipment.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {hero.equipment.map((e) => (e.quantity > 1 ? `${e.item.name} ×${e.quantity}` : e.item.name)).join(', ')}
                  </p>
                )}
              </div>
              <span className="text-sm text-gold font-medium shrink-0">
                {hero.position.cost + hero.equipment.reduce((s, e) => s + e.item.cost * e.quantity, 0)} gc
              </span>
            </div>
          ))}
          {henchmen.map((group) => (
            <div key={group.tempId} className="flex justify-between items-start gap-4 px-4 py-2.5 border-b border-border/50 last:border-b-0">
              <div>
                <span className="text-sm font-medium text-foreground">
                  {group.position.name} <span className="text-muted-foreground">×{group.count}</span>
                </span>
                {group.equipment.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {group.equipment.map((e) => (e.quantity > 1 ? `${e.item.name} ×${e.quantity}` : e.item.name)).join(', ')}
                  </p>
                )}
              </div>
              <span className="text-sm text-gold font-medium shrink-0">
                {group.count * group.position.cost + group.equipment.reduce((s, e) => s + e.item.cost * e.quantity, 0)} gc
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Gold breakdown */}
      <section className="rounded-md border border-border bg-card p-4 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Heroes ({heroes.length})</span>
          <span>{heroesCost()} gc</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Henchmen ({henchmen.reduce((s, h) => s + h.count, 0)})</span>
          <span>{henchmenCost()} gc</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Equipment</span>
          <span>{equipmentCost()} gc</span>
        </div>
        <div className="flex justify-between font-bold border-t border-border pt-2">
          <span className="text-foreground">Total spent</span>
          <span className={goldSpent() > startingGold ? 'text-red-400' : 'text-gold'}>
            {goldSpent()} / {startingGold} gc
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Treasury (remaining)</span>
          <span className="text-gold">{goldRemaining()} gc</span>
        </div>
        <div className="flex justify-between text-sm border-t border-border pt-2">
          <span className="text-muted-foreground">Starting Warband Rating</span>
          <span className="text-gold">{totalModels() * 5}</span>
        </div>
      </section>

      {/* Submit buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSaveDraft}
          disabled={submitting}
          className="flex-1 px-4 py-2.5 rounded border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Saving…' : 'Save as Draft'}
        </button>
        <button
          onClick={() => submitWarband('submitted')}
          disabled={!canSubmit || submitting}
          className="flex-1 px-4 py-2.5 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting…' : canSubmit ? 'Submit Warband →' : `Fix ${errors.length} error${errors.length !== 1 ? 's' : ''} first`}
        </button>
      </div>
    </div>
  )
}

function CheckRow({ ok, label, errorMsg }: { ok: boolean; label: string; errorMsg: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={ok ? 'text-emerald-400' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
      <span className={`text-sm ${ok ? 'text-foreground' : 'text-red-400'}`}>
        {ok ? label : errorMsg}
      </span>
    </div>
  )
}
