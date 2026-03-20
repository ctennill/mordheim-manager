'use client'

import { useState, useTransition } from 'react'
import { setFactionEquipment } from '@/lib/admin/actions'
import { type Equipment } from '@/types/database'

const CATEGORY_LABELS: Record<string, string> = {
  hand_weapon: 'Hand Weapons', two_handed: 'Two-Handed', missile: 'Missile',
  armor: 'Armour', helmet: 'Helmets', shield: 'Shields',
  miscellaneous: 'Miscellaneous', magic: 'Magic Items',
}

interface FactionEquipmentManagerProps {
  factionId: string
  allEquipment: Equipment[]
  currentLinks: { equipment_id: string; is_faction_specific: boolean }[]
}

export function FactionEquipmentManager({ factionId, allEquipment, currentLinks }: FactionEquipmentManagerProps) {
  const [checked, setChecked] = useState<Set<string>>(
    new Set(currentLinks.map(l => l.equipment_id))
  )
  const [factionSpecific, setFactionSpecific] = useState<Set<string>>(
    new Set(currentLinks.filter(l => l.is_faction_specific).map(l => l.equipment_id))
  )
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function toggleEquipment(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); setFactionSpecific(fs => { const n = new Set(fs); n.delete(id); return n }) }
      else next.add(id)
      return next
    })
    setSaved(false)
  }

  function toggleFactionSpecific(id: string) {
    setFactionSpecific(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await setFactionEquipment(factionId, [...checked], [...factionSpecific])
      setSaved(true)
    })
  }

  const byCategory = Object.entries(CATEGORY_LABELS).map(([cat, catLabel]) => ({
    catLabel,
    items: allEquipment.filter(e => e.category === cat),
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-4">
      {byCategory.map(({ catLabel, items }) => (
        <div key={catLabel}>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-2">{catLabel}</h4>
          <div className="space-y-1">
            {items.map(eq => (
              <div key={eq.id} className="flex items-center gap-3 text-sm py-0.5">
                <input
                  type="checkbox"
                  id={`eq-${eq.id}`}
                  checked={checked.has(eq.id)}
                  onChange={() => toggleEquipment(eq.id)}
                  className="accent-amber-500"
                />
                <label htmlFor={`eq-${eq.id}`} className="flex-1 cursor-pointer text-foreground">
                  {eq.name}
                  <span className="ml-2 text-xs text-muted-foreground">{eq.cost} gc</span>
                </label>
                {checked.has(eq.id) && (
                  <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={factionSpecific.has(eq.id)}
                      onChange={() => toggleFactionSpecific(eq.id)}
                      className="accent-amber-500"
                    />
                    Faction-specific
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="px-5 py-2 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save Equipment List'}
        </button>
        {saved && <span className="text-xs text-emerald-400">Saved</span>}
      </div>
    </div>
  )
}
