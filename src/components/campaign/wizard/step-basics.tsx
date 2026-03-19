'use client'

import { useCampaignCreation } from '@/store/campaign-creation'
import { type CampaignMode, type CampaignPrivacy } from '@/types/database'

const MODES: { value: CampaignMode; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard',  description: '2–12 players, scheduled sessions, paired battles' },
  { value: 'open',     label: 'Open',      description: 'Players join/leave freely, battles logged as-played' },
  { value: 'event',    label: 'Event',     description: 'Fixed sessions, all battles in a single weekend' },
  { value: 'solo',     label: 'Solo',      description: 'Single player runs a warband through the campaign' },
]

const PRIVACY: { value: CampaignPrivacy; label: string; description: string }[] = [
  { value: 'public',   label: 'Public',   description: 'Visible in campaign browser — anyone can request to join' },
  { value: 'unlisted', label: 'Unlisted', description: 'Only accessible via direct link' },
  { value: 'private',  label: 'Private',  description: 'Invite only — commissioner adds players directly' },
]

export function StepBasics() {
  const state = useCampaignCreation()

  return (
    <div className="max-w-xl space-y-6">
      {/* Campaign Name */}
      <Field label="Campaign Name" required>
        <input
          type="text"
          value={state.name}
          onChange={(e) => state.set({ name: e.target.value })}
          placeholder="The Siege of Mordheim"
          maxLength={80}
          className="field-input"
        />
        <p className="text-xs text-muted-foreground mt-1">{state.name.length} / 80</p>
      </Field>

      {/* Campaign Mode */}
      <Field label="Campaign Mode" required>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => state.set({ mode: m.value })}
              className={`text-left p-3 rounded border transition-colors ${
                state.mode === m.value
                  ? 'border-gold/60 bg-gold/10 text-foreground'
                  : 'border-border hover:border-gold/20 text-muted-foreground'
              }`}
            >
              <div className="font-medium text-sm text-foreground">{m.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.description}</div>
            </button>
          ))}
        </div>
      </Field>

      {/* Location */}
      <Field label="Location">
        <input
          type="text"
          value={state.location}
          onChange={(e) => state.set({ location: e.target.value })}
          placeholder="Online, London UK, Game Store Name…"
          maxLength={100}
          className="field-input"
        />
      </Field>

      {/* Privacy */}
      <Field label="Privacy">
        <div className="space-y-2">
          {PRIVACY.map((p) => (
            <label key={p.value} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                value={p.value}
                checked={state.privacy === p.value}
                onChange={() => state.set({ privacy: p.value })}
                className="mt-1 accent-gold"
              />
              <div>
                <div className="text-sm font-medium text-foreground">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.description}</div>
              </div>
            </label>
          ))}
        </div>
      </Field>

      {/* Description */}
      <Field label="Description" hint="Optional — shown on the campaign's public page">
        <textarea
          value={state.description}
          onChange={(e) => state.set({ description: e.target.value })}
          placeholder="The Skaven have overrun the city. Only the bravest warbands dare enter…"
          rows={4}
          maxLength={2000}
          className="field-input resize-none"
        />
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
