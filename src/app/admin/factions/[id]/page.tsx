import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FactionForm } from '@/components/admin/faction-form'
import { FactionEquipmentManager } from '@/components/admin/faction-equipment-manager'
import { DeleteButton } from '@/components/admin/delete-button'
import { updateFaction, deletePosition } from '@/lib/admin/actions'
import { type Faction, type FactionPosition, type Equipment, type FactionEquipment } from '@/types/database'

export default async function EditFactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [factionRes, positionsRes, allEquipmentRes, currentLinksRes] = await Promise.all([
    (supabase.from('factions').select('*').eq('id', id).single()) as unknown as Promise<{ data: Faction | null }>,
    (supabase.from('faction_positions').select('*').eq('faction_id', id).order('sort_order').order('name')) as unknown as Promise<{ data: FactionPosition[] | null }>,
    (supabase.from('equipment').select('*').order('category').order('name')) as unknown as Promise<{ data: Equipment[] | null }>,
    (supabase.from('faction_equipment').select('equipment_id, is_faction_specific').eq('faction_id', id)) as unknown as Promise<{ data: Pick<FactionEquipment, 'equipment_id' | 'is_faction_specific'>[] | null }>,
  ])

  if (!factionRes.data) notFound()
  const faction = factionRes.data
  const positions = positionsRes.data ?? []
  const allEquipment = allEquipmentRes.data ?? []
  const currentLinks = currentLinksRes.data ?? []

  const boundUpdate = updateFaction.bind(null, id)

  const heroes = positions.filter(p => p.warrior_type === 'hero')
  const henchmen = positions.filter(p => p.warrior_type === 'henchman')

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/factions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Factions</Link>
          <span className="text-muted-foreground/30">/</span>
          <h1 className="font-cinzel text-xl font-bold text-foreground">{faction.name}</h1>
        </div>
        <Link
          href={`/admin/factions/${id}/positions/new`}
          className="px-3 py-1.5 text-xs border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 rounded transition-colors"
        >
          + Add Position
        </Link>
      </div>

      {/* Faction details form */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest text-muted-foreground/60">Faction Details</h2>
        <FactionForm action={boundUpdate} initialData={faction} submitLabel="Save Faction" />
      </section>

      {/* Roster positions */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Roster Positions ({positions.length})</h2>

        {positions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No positions yet. <Link href={`/admin/factions/${id}/positions/new`} className="text-gold hover:underline">Add one</Link>.</p>
        ) : (
          <div className="space-y-3">
            {heroes.length > 0 && (
              <PositionGroup factionId={id} label="Heroes" positions={heroes} />
            )}
            {henchmen.length > 0 && (
              <PositionGroup factionId={id} label="Henchmen" positions={henchmen} />
            )}
          </div>
        )}
      </section>

      {/* Equipment availability */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Equipment Availability</h2>
        <FactionEquipmentManager
          factionId={id}
          allEquipment={allEquipment}
          currentLinks={currentLinks}
        />
      </section>
    </div>
  )
}

function PositionGroup({ factionId, label, positions }: { factionId: string; label: string; positions: FactionPosition[] }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground/40 mb-2">{label}</h3>
      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-card/60">
            <tr>
              <th className="px-3 py-2 text-left text-xs text-muted-foreground font-normal">Name</th>
              <th className="px-3 py-2 text-center text-xs text-muted-foreground font-normal">Count</th>
              <th className="px-3 py-2 text-center text-xs font-mono text-muted-foreground font-normal">M</th>
              <th className="px-3 py-2 text-center text-xs font-mono text-muted-foreground font-normal">WS</th>
              <th className="px-3 py-2 text-center text-xs font-mono text-muted-foreground font-normal">BS</th>
              <th className="px-3 py-2 text-center text-xs font-mono text-muted-foreground font-normal">S</th>
              <th className="px-3 py-2 text-center text-xs font-mono text-muted-foreground font-normal">T</th>
              <th className="px-3 py-2 text-center text-xs font-mono text-muted-foreground font-normal">W</th>
              <th className="px-3 py-2 text-center text-xs font-mono text-muted-foreground font-normal">I</th>
              <th className="px-3 py-2 text-center text-xs font-mono text-muted-foreground font-normal">A</th>
              <th className="px-3 py-2 text-center text-xs font-mono text-muted-foreground font-normal">Ld</th>
              <th className="px-3 py-2 text-right text-xs text-muted-foreground font-normal">Cost</th>
              <th className="px-3 py-2 text-right text-xs text-muted-foreground font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {positions.map(p => (
              <tr key={p.id} className="hover:bg-white/2 transition-colors">
                <td className="px-3 py-2">
                  <Link href={`/admin/factions/${factionId}/positions/${p.id}`} className="text-foreground hover:text-gold transition-colors">
                    {p.name}
                    {p.is_leader && <span className="ml-1 text-xs text-amber-500">★</span>}
                  </Link>
                  {p.special_rules.length > 0 && (
                    <div className="text-xs text-muted-foreground/60 mt-0.5">{p.special_rules.join(', ')}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-center text-muted-foreground text-xs">{p.min_count}–{p.max_count}</td>
                {[p.move, p.weapon_skill, p.ballistic_skill, p.strength, p.toughness, p.wounds, p.initiative, p.attacks, p.leadership].map((v, i) => (
                  <td key={i} className="px-3 py-2 text-center font-mono text-xs">{v}</td>
                ))}
                <td className="px-3 py-2 text-right text-xs font-mono text-muted-foreground">{p.cost} gc</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/factions/${factionId}/positions/${p.id}`} className="text-xs text-muted-foreground hover:text-foreground">Edit</Link>
                    <DeleteButton
                      action={deletePosition.bind(null, p.id, factionId)}
                      confirmMessage={`Delete position "${p.name}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
