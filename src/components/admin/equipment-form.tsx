'use client'

import { useActionState } from 'react'
import { TagInput } from './tag-input'
import { ModGrid } from './stat-grid'
import { type Equipment } from '@/types/database'

const RULE_SUGGESTIONS = [
  'Parry', 'Ignore Shields', 'Ignore Helmets', 'Ignore Armour',
  'Strike Last', 'Strike First', 'Quick Shot', 'Thrown Weapon',
  'Two-Handed', 'Flail', 'Pistol', 'Pistol (Hand-to-Hand)',
  'Long Range', 'Short Range', 'Fire Every Other Turn',
  'Knockdown', 'Armour Save Modifier', 'Rune Weapon',
]

interface EquipmentFormProps {
  action: (prev: unknown, formData: FormData) => Promise<{ error: string } | void>
  initialData?: Partial<Equipment>
  submitLabel?: string
}

const field = 'px-3 py-1.5 text-sm bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 w-full'
const label = 'block text-xs text-muted-foreground mb-1'

export function EquipmentForm({ action, initialData, submitLabel = 'Save' }: EquipmentFormProps) {
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
          <input name="name" required defaultValue={initialData?.name ?? ''} className={field} placeholder="e.g. Sword" />
        </div>

        <div>
          <label className={label}>Category</label>
          <select name="category" defaultValue={initialData?.category ?? 'hand_weapon'} className={field}>
            <option value="hand_weapon">Hand Weapon</option>
            <option value="two_handed">Two-Handed Weapon</option>
            <option value="missile">Missile Weapon</option>
            <option value="armor">Armour</option>
            <option value="helmet">Helmet</option>
            <option value="shield">Shield</option>
            <option value="miscellaneous">Miscellaneous</option>
            <option value="magic">Magic Item</option>
          </select>
        </div>

        <div>
          <label className={label}>Cost (gc)</label>
          <input name="cost" type="number" min={0} defaultValue={initialData?.cost ?? 0} className={field} />
        </div>

        <div>
          <label className={label}>Rarity (0 = common, 1–6 = roll required)</label>
          <input name="rarity" type="number" min={0} max={6} defaultValue={initialData?.rarity ?? 0} className={field} />
        </div>

        <div>
          <label className={label}>Max Per Warrior</label>
          <input name="max_per_warrior" type="number" min={1} defaultValue={initialData?.max_per_warrior ?? 1} className={field} />
        </div>

        <div>
          <label className={label}>Is Magic Item?</label>
          <select name="is_magic" defaultValue={initialData?.is_magic ? 'true' : 'false'} className={field}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className={label}>Description / Notes</label>
          <textarea name="description" rows={3} defaultValue={initialData?.description ?? ''} className={`${field} resize-y`} placeholder="Rules text, range, saves…" />
        </div>
      </div>

      {/* Stat modifiers */}
      <div>
        <label className={label}>Stat Modifiers (leave blank for no effect)</label>
        <ModGrid initialValues={initialData ? {
          mod_move: initialData.mod_move,
          mod_weapon_skill: initialData.mod_weapon_skill,
          mod_ballistic_skill: initialData.mod_ballistic_skill,
          mod_strength: initialData.mod_strength,
          mod_toughness: initialData.mod_toughness,
          mod_wounds: initialData.mod_wounds,
          mod_initiative: initialData.mod_initiative,
          mod_attacks: initialData.mod_attacks,
          mod_leadership: initialData.mod_leadership,
        } : undefined} />
      </div>

      {/* Special rules */}
      <div>
        <label className={label}>Special Rules</label>
        <TagInput name="special_rules" initialTags={initialData?.special_rules ?? []} suggestions={RULE_SUGGESTIONS} placeholder="Parry, Strike Last…" />
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
