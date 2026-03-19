'use client'

import { useState } from 'react'
import { useWarbandBuilder } from '@/store/warband-builder'
import { useFactionEquipment } from '@/hooks/use-faction-data'
import { EquipmentSheet } from '@/components/warband/equipment-sheet'
import { type Equipment } from '@/types/database'

export function StepEquip() {
  const {
    factionId, heroes, henchmen,
    setHeroEquipmentQty, setHenchmanEquipmentQty,
    goldRemaining,
  } = useWarbandBuilder()

  const { data: availableEquipment = [], isLoading } = useFactionEquipment(factionId)
  const [openSheet, setOpenSheet] = useState<{ type: 'hero' | 'henchman'; tempId: string } | null>(null)

  const currentSheet = openSheet
    ? openSheet.type === 'hero'
      ? heroes.find((h) => h.tempId === openSheet.tempId)
      : henchmen.find((h) => h.tempId === openSheet.tempId)
    : undefined

  function handleSetQty(item: Equipment, quantity: number) {
    if (!openSheet) return
    if (openSheet.type === 'hero') {
      setHeroEquipmentQty(openSheet.tempId, item, quantity)
    } else {
      setHenchmanEquipmentQty(openSheet.tempId, item, quantity)
    }
  }

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-md bg-muted/30 animate-pulse" />)}</div>
  }

  const equipmentCostFor = (entries: typeof heroes[0]['equipment']) =>
    entries.reduce((sum, e) => sum + e.item.cost * e.quantity, 0)

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Equip each warrior. Click a warrior to open the equipment panel. All models in a henchman
        group share the same equipment.
      </p>

      {/* Heroes */}
      {heroes.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground/60">Heroes</h3>
          <div className="space-y-2">
            {heroes.map((hero) => {
              const eq = hero.equipment
              const cost = equipmentCostFor(eq)
              return (
                <div
                  key={hero.tempId}
                  className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {hero.name || hero.position.name}
                      <span className="text-muted-foreground ml-1 text-xs">({hero.position.name})</span>
                    </p>
                    {eq.length > 0 ? (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {eq.map((e) => (e.quantity > 1 ? `${e.item.name} ×${e.quantity}` : e.item.name)).join(', ')}
                        <span className="text-gold ml-2">{cost} gc</span>
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 mt-0.5">No equipment</p>
                    )}
                  </div>
                  <button
                    onClick={() => setOpenSheet({ type: 'hero', tempId: hero.tempId })}
                    className="shrink-0 px-3 py-1.5 text-sm border border-border rounded hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    Manage Equipment
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Henchmen */}
      {henchmen.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground/60">Henchmen</h3>
          <div className="space-y-2">
            {henchmen.map((group) => {
              const eq = group.equipment
              const cost = equipmentCostFor(eq)
              return (
                <div
                  key={group.tempId}
                  className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {group.position.name}
                      <span className="text-muted-foreground ml-1 text-xs">×{group.count}</span>
                    </p>
                    {eq.length > 0 ? (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {eq.map((e) => (e.quantity > 1 ? `${e.item.name} ×${e.quantity}` : e.item.name)).join(', ')}
                        <span className="text-gold ml-2">{cost} gc ea</span>
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 mt-0.5">No equipment</p>
                    )}
                  </div>
                  <button
                    onClick={() => setOpenSheet({ type: 'henchman', tempId: group.tempId })}
                    className="shrink-0 px-3 py-1.5 text-sm border border-border rounded hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    Manage Equipment
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Equipment sheet */}
      {openSheet && currentSheet && (
        <EquipmentSheet
          open={true}
          onClose={() => setOpenSheet(null)}
          warriorName={
            openSheet.type === 'hero'
              ? ((currentSheet as typeof heroes[0]).name || (currentSheet as typeof heroes[0]).position.name)
              : `${(currentSheet as typeof henchmen[0]).position.name} ×${(currentSheet as typeof henchmen[0]).count}`
          }
          currentEquipment={currentSheet.equipment}
          availableEquipment={availableEquipment}
          onSetQuantity={handleSetQty}
          goldRemaining={goldRemaining()}
        />
      )}
    </div>
  )
}
