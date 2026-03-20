'use client'

import { useActionState } from 'react'
import { TagInput } from './tag-input'
import { type Faction } from '@/types/database'

const SKILL_SUGGESTIONS = ['Combat', 'Shooting', 'Academic', 'Speed', 'Stealth', 'Strength', 'Special']

interface FactionFormProps {
  action: (prev: unknown, formData: FormData) => Promise<{ error: string } | void>
  initialData?: Partial<Faction>
  submitLabel?: string
}

const field = 'px-3 py-1.5 text-sm bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 w-full'
const label = 'block text-xs text-muted-foreground mb-1'

export function FactionForm({ action, initialData, submitLabel = 'Save' }: FactionFormProps) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-6">
      {state && typeof state === 'object' && 'error' in state ? (
        <p className="text-sm text-red-400 bg-red-950/20 border border-red-800/40 rounded px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={label}>Name *</label>
          <input name="name" required defaultValue={initialData?.name ?? ''} className={field} placeholder="e.g. Reiklanders" />
        </div>

        <div>
          <label className={label}>Type</label>
          <select name="type" defaultValue={initialData?.type ?? 'official'} className={field}>
            <option value="official">Official</option>
            <option value="supplement">Supplement</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className={label}>Ruleset</label>
          <select name="ruleset" defaultValue={initialData?.ruleset ?? 'core'} className={field}>
            <option value="core">Core</option>
            <option value="town_cryer">Town Cryer</option>
            <option value="community">Community</option>
          </select>
        </div>

        <div>
          <label className={label}>Alignment</label>
          <select name="alignment" defaultValue={initialData?.alignment ?? ''} className={field}>
            <option value="">— None —</option>
            <option value="law">Law</option>
            <option value="neutral">Neutral</option>
            <option value="chaos">Chaos</option>
          </select>
        </div>

        <div>
          <label className={label}>Starting Gold (gc)</label>
          <input name="starting_gold" type="number" min={0} defaultValue={initialData?.starting_gold ?? 500} className={field} />
        </div>

        <div>
          <label className={label}>Min Warband Size</label>
          <input name="min_warband_size" type="number" min={1} defaultValue={initialData?.min_warband_size ?? 3} className={field} />
        </div>

        <div>
          <label className={label}>Max Warband Size</label>
          <input name="max_warband_size" type="number" min={1} defaultValue={initialData?.max_warband_size ?? 15} className={field} />
        </div>

        <div className="col-span-2">
          <label className={label}>Enabled</label>
          <select name="is_enabled" defaultValue={initialData?.is_enabled !== false ? 'true' : 'false'} className={field}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className={label}>Special Rules</label>
          <TagInput name="special_rules" initialTags={initialData?.special_rules ?? []} suggestions={SKILL_SUGGESTIONS} placeholder="Add rule, press Enter" />
        </div>

        <div className="col-span-2">
          <label className={label}>Lore / Description</label>
          <textarea name="lore" rows={4} defaultValue={initialData?.lore ?? ''} className={`${field} resize-y`} placeholder="Background lore and flavour text…" />
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
