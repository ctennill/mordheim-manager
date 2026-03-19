'use client'

import { useCampaignCreation } from '@/store/campaign-creation'

const RULESETS = [
  { value: 'core',      label: 'Core Mordheim 2019',       description: 'The classic rulebook, revised 2019 edition' },
  { value: 'towncryer', label: 'Town Cryer Compilation',   description: 'Includes all official supplements' },
  { value: 'community', label: 'Community Edition',        description: 'Fan-maintained balanced ruleset' },
  { value: 'custom',    label: 'Custom',                   description: 'House rules — document them in the campaign description' },
]

const MAGIC_OPTIONS = [
  { value: 'core',     label: 'Core only',  description: 'Only magic items from the core rulebook' },
  { value: 'all',      label: 'All',        description: 'Items from all supplements allowed' },
  { value: 'disabled', label: 'Disabled',   description: 'No magic items in this campaign' },
]

export function StepRules() {
  const state = useCampaignCreation()

  return (
    <div className="max-w-xl space-y-6">
      {/* Ruleset */}
      <Field label="Ruleset" required>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RULESETS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => state.set({ ruleset: r.value })}
              className={`text-left p-3 rounded border transition-colors ${
                state.ruleset === r.value
                  ? 'border-gold/60 bg-gold/10 text-foreground'
                  : 'border-border hover:border-gold/20 text-muted-foreground'
              }`}
            >
              <div className="font-medium text-sm text-foreground">{r.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
            </button>
          ))}
        </div>
      </Field>

      {/* Starting Gold */}
      <Field label="Starting Gold" hint="300–750 gc">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={300}
            max={750}
            step={50}
            value={state.startingGold}
            onChange={(e) => state.set({ startingGold: Number(e.target.value) })}
            className="flex-1 accent-gold"
          />
          <span className="text-sm font-mono text-gold w-16 text-right">{state.startingGold} gc</span>
        </div>
      </Field>

      {/* Starting XP Bonus */}
      <Field label="Starting XP Bonus" hint="Added to every hero at warband creation">
        <div className="flex gap-2">
          {[0, 2, 5].map((xp) => (
            <button
              key={xp}
              type="button"
              onClick={() => state.set({ startingXpBonus: xp })}
              className={`px-4 py-1.5 rounded border text-sm transition-colors ${
                state.startingXpBonus === xp
                  ? 'border-gold/60 bg-gold/10 text-gold'
                  : 'border-border hover:border-gold/20 text-muted-foreground'
              }`}
            >
              {xp === 0 ? 'None' : `+${xp} XP`}
            </button>
          ))}
        </div>
      </Field>

      {/* Max Warband Size */}
      <Field label="Max Warband Size" hint="Warriors per warband">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={10}
            max={20}
            step={1}
            value={state.maxWarbandSize}
            onChange={(e) => state.set({ maxWarbandSize: Number(e.target.value) })}
            className="flex-1 accent-gold"
          />
          <span className="text-sm font-mono text-gold w-16 text-right">{state.maxWarbandSize} models</span>
        </div>
      </Field>

      {/* Max Warbands */}
      <Field label="Max Warbands in Campaign">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={state.maxWarbands}
            onChange={(e) => state.set({ maxWarbands: Number(e.target.value) })}
            className="flex-1 accent-gold"
          />
          <span className="text-sm font-mono text-gold w-16 text-right">{state.maxWarbands} players</span>
        </div>
      </Field>

      {/* Feature Toggles */}
      <Field label="Optional Rules">
        <div className="space-y-3">
          <Toggle
            label="Hired Swords"
            description="Allow warbands to recruit hired sword mercenaries"
            checked={state.hiredSwordsEnabled}
            onChange={(v) => state.set({ hiredSwordsEnabled: v })}
          />
          <Toggle
            label="Dramatis Personae"
            description="Allow legendary named characters to join warbands"
            checked={state.dramatisPersonaeEnabled}
            onChange={(v) => state.set({ dramatisPersonaeEnabled: v })}
          />
          <Toggle
            label="Alignment Rules"
            description="Enforce Law / Neutrality / Chaos faction restrictions"
            checked={state.alignmentRulesEnabled}
            onChange={(v) => state.set({ alignmentRulesEnabled: v })}
          />
        </div>
      </Field>

      {/* Magic Items */}
      <Field label="Magic Items">
        <div className="space-y-2">
          {MAGIC_OPTIONS.map((m) => (
            <label key={m.value} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="magic"
                value={m.value}
                checked={state.magicItemsSetting === m.value}
                onChange={() => state.set({ magicItemsSetting: m.value as typeof state.magicItemsSetting })}
                className="mt-1 accent-gold"
              />
              <div>
                <div className="text-sm font-medium text-foreground">{m.label}</div>
                <div className="text-xs text-muted-foreground">{m.description}</div>
              </div>
            </label>
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

function Toggle({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`w-9 h-5 rounded-full border transition-colors ${
          checked ? 'bg-gold/20 border-gold/60' : 'bg-muted/50 border-border'
        }`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform transition-colors ${
          checked ? 'translate-x-4 bg-gold' : 'translate-x-0 bg-muted-foreground/40'
        }`} />
      </div>
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </label>
  )
}
