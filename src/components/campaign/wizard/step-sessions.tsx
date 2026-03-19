'use client'

import { useCampaignCreation } from '@/store/campaign-creation'
import { type PairingMethod } from '@/types/database'

const PAIRING_METHODS: { value: PairingMethod; label: string; description: string }[] = [
  { value: 'commissioner', label: 'Commissioner',  description: 'Commissioner assigns match-ups each session' },
  { value: 'random',       label: 'Random Draw',   description: 'System randomly pairs players each session' },
  { value: 'swiss',        label: 'Swiss System',  description: 'Players with similar records are matched' },
  { value: 'round_robin',  label: 'Round Robin',   description: 'Every player faces every other player once' },
]

export function StepSessions() {
  const state = useCampaignCreation()
  const isOpenEnded = state.totalSessions === null

  return (
    <div className="max-w-xl space-y-6">
      {/* Total Sessions */}
      <Field label="Campaign Length">
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isOpenEnded}
              onChange={(e) => state.set({ totalSessions: e.target.checked ? null : 8 })}
              className="accent-gold"
            />
            <span className="text-sm text-foreground">Open-ended (no fixed end date)</span>
          </label>
          {!isOpenEnded && (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={2}
                max={20}
                step={1}
                value={state.totalSessions ?? 8}
                onChange={(e) => state.set({ totalSessions: Number(e.target.value) })}
                className="flex-1 accent-gold"
              />
              <span className="text-sm font-mono text-gold w-24 text-right">
                {state.totalSessions} sessions
              </span>
            </div>
          )}
        </div>
      </Field>

      {/* Pairing Method */}
      <Field label="Battle Pairing Method" required>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PAIRING_METHODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => state.set({ pairingMethod: p.value })}
              className={`text-left p-3 rounded border transition-colors ${
                state.pairingMethod === p.value
                  ? 'border-gold/60 bg-gold/10 text-foreground'
                  : 'border-border hover:border-gold/20 text-muted-foreground'
              }`}
            >
              <div className="font-medium text-sm text-foreground">{p.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.description}</div>
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {hint && <span className="text-muted-foreground font-normal ml-1.5 text-xs">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}
