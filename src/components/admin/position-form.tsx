'use client'

import { useActionState } from 'react'
import { TagInput } from './tag-input'
import { StatGrid } from './stat-grid'
import { type FactionPosition } from '@/types/database'

const SKILL_SUGGESTIONS = ['Combat', 'Shooting', 'Academic', 'Speed', 'Stealth', 'Strength', 'Special']
const RULE_SUGGESTIONS = [
  'Cause Fear', 'Immune to Psychology', 'Immune to Fear', 'Fear',
  'Frenzy', 'Stupidity', 'Regenerate', 'Scaly Skin', 'Undead',
  'Daemon', 'Animal', 'Infiltrate', 'Ambushers', 'Treasure Hunter',
  'May Not Ride', 'Prayers of Sigmar', 'Necromantic Magic',
  'Waaagh! Magic', 'Beast Magic', 'Chaos Rituals',
  'Hatred', 'Hatred (Undead)', 'Hatred (Chaos)',
  'Skaven Infiltrators', 'Scurry Away', 'Mutation',
  'Leader', 'Seer', 'Always Strikes Last', 'Strike First',
  'Dodge', 'Sprint',
]

interface PositionFormProps {
  action: (prev: unknown, formData: FormData) => Promise<{ error: string } | void>
  initialData?: Partial<FactionPosition>
  submitLabel?: string
}

const field = 'px-3 py-1.5 text-sm bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 w-full'
const label = 'block text-xs text-muted-foreground mb-1'

export function PositionForm({ action, initialData, submitLabel = 'Save' }: PositionFormProps) {
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
          <input name="name" required defaultValue={initialData?.name ?? ''} className={field} placeholder="e.g. Captain" />
        </div>

        <div>
          <label className={label}>Warrior Type</label>
          <select name="warrior_type" defaultValue={initialData?.warrior_type ?? 'hero'} className={field}>
            <option value="hero">Hero</option>
            <option value="henchman">Henchman</option>
          </select>
        </div>

        <div>
          <label className={label}>Is Leader?</label>
          <select name="is_leader" defaultValue={initialData?.is_leader ? 'true' : 'false'} className={field}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div>
          <label className={label}>Min Count</label>
          <input name="min_count" type="number" min={0} defaultValue={initialData?.min_count ?? 0} className={field} />
        </div>

        <div>
          <label className={label}>Max Count</label>
          <input name="max_count" type="number" min={0} defaultValue={initialData?.max_count ?? 1} className={field} />
        </div>

        <div>
          <label className={label}>Cost (gc)</label>
          <input name="cost" type="number" min={0} defaultValue={initialData?.cost ?? 0} className={field} />
        </div>

        <div>
          <label className={label}>Sort Order</label>
          <input name="sort_order" type="number" min={0} defaultValue={initialData?.sort_order ?? 0} className={field} />
        </div>
      </div>

      {/* Stats */}
      <div>
        <label className={label}>Base Statistics</label>
        <StatGrid initialValues={initialData ? {
          move: initialData.move,
          weapon_skill: initialData.weapon_skill,
          ballistic_skill: initialData.ballistic_skill,
          strength: initialData.strength,
          toughness: initialData.toughness,
          wounds: initialData.wounds,
          initiative: initialData.initiative,
          attacks: initialData.attacks,
          leadership: initialData.leadership,
        } : undefined} />
      </div>

      {/* Skills */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Primary Skills</label>
          <TagInput name="primary_skills" initialTags={initialData?.primary_skills ?? []} suggestions={SKILL_SUGGESTIONS} placeholder="Combat, Shooting…" />
        </div>
        <div>
          <label className={label}>Secondary Skills</label>
          <TagInput name="secondary_skills" initialTags={initialData?.secondary_skills ?? []} suggestions={SKILL_SUGGESTIONS} placeholder="Academic, Speed…" />
        </div>
      </div>

      {/* Special Rules */}
      <div>
        <label className={label}>Special Rules</label>
        <TagInput name="special_rules" initialTags={initialData?.special_rules ?? []} suggestions={RULE_SUGGESTIONS} placeholder="Cause Fear, Undead…" />
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
