'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { type Equipment } from '@/types/database'
import { type EquipmentEntry } from '@/store/warband-builder'
import { type FactionEquipmentRow } from '@/hooks/use-faction-data'

interface EquipmentSheetProps {
  open: boolean
  onClose: () => void
  warriorName: string
  currentEquipment: EquipmentEntry[]
  availableEquipment: FactionEquipmentRow[]
  onSetQuantity: (item: Equipment, quantity: number) => void
  goldRemaining: number
}

const CATEGORY_ORDER = [
  'hand_weapon', 'two_handed', 'missile', 'armor', 'helmet', 'shield', 'miscellaneous', 'magic',
]

const CATEGORY_LABELS: Record<string, string> = {
  hand_weapon:   'Hand Weapons',
  two_handed:    'Two-Handed Weapons',
  missile:       'Missile Weapons',
  armor:         'Armour',
  helmet:        'Helmets',
  shield:        'Shields',
  miscellaneous: 'Miscellaneous',
  magic:         'Magic Items',
}

export function EquipmentSheet({
  open,
  onClose,
  warriorName,
  currentEquipment,
  availableEquipment,
  onSetQuantity,
  goldRemaining,
}: EquipmentSheetProps) {
  const [search, setSearch] = useState('')

  const currentQty = (itemId: string) =>
    currentEquipment.find((e) => e.item.id === itemId)?.quantity ?? 0

  // Group by category, apply search filter
  const grouped = CATEGORY_ORDER.reduce<Record<string, FactionEquipmentRow[]>>((acc, cat) => {
    const items = availableEquipment
      .filter(
        (row) =>
          row.equipment?.category === cat &&
          (!search || row.equipment.name.toLowerCase().includes(search.toLowerCase()))
      )
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  const currentCost = currentEquipment.reduce((sum, e) => sum + e.item.cost * e.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-card border-border">
        <SheetHeader className="space-y-1 pb-4 border-b border-border">
          <SheetTitle
            className="text-gold text-lg"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Equip: {warriorName}
          </SheetTitle>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Equipment cost: {currentCost} gc</span>
            <span className={goldRemaining < 0 ? 'text-red-400' : 'text-gold'}>
              {goldRemaining} gc remaining
            </span>
          </div>
        </SheetHeader>

        {/* Search */}
        <div className="py-3 border-b border-border">
          <input
            type="text"
            placeholder="Search equipment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Equipment list */}
        <div className="space-y-5 pt-4">
          {Object.entries(grouped).map(([cat, rows]) => (
            <div key={cat}>
              <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground/60 mb-2">
                {CATEGORY_LABELS[cat] ?? cat}
              </h4>
              <div className="space-y-1">
                {rows.map((row) => {
                  const item = row.equipment
                  if (!item) return null
                  const qty = currentQty(item.id)
                  const atMax = qty >= item.max_per_warrior
                  const canAffordOne = goldRemaining + (qty > 0 ? 0 : 0) >= item.cost
                  const canAdd = !atMax && (goldRemaining >= item.cost || qty > 0)

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-muted/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {row.is_faction_specific && (
                            <span className="text-[10px] text-gold" title="Faction-specific">★</span>
                          )}
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                          {item.rarity > 0 && (
                            <span className="text-[10px] text-muted-foreground">(Rare {item.rarity})</span>
                          )}
                        </div>
                        {item.special_rules.length > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {item.special_rules.join(' · ')}
                          </p>
                        )}
                      </div>

                      {/* Cost + qty controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-gold font-medium w-14 text-right">
                          {item.cost} gc
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onSetQuantity(item, qty - 1)}
                            disabled={qty === 0}
                            className="w-6 h-6 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-mono tabular-nums">
                            {qty}
                          </span>
                          <button
                            onClick={() => onSetQuantity(item, qty + 1)}
                            disabled={atMax || !canAdd}
                            className="w-6 h-6 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={atMax ? `Max ${item.max_per_warrior} per warrior` : !canAffordOne ? 'Not enough gold' : ''}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(grouped).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {search ? 'No equipment matches your search.' : 'No equipment available.'}
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}
