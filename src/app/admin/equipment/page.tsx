import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteEquipment } from '@/lib/admin/actions'
import { type Equipment } from '@/types/database'

export const metadata = { title: 'Equipment Admin' }

const CATEGORY_LABELS: Record<string, string> = {
  hand_weapon: 'Hand Weapon', two_handed: 'Two-Handed', missile: 'Missile',
  armor: 'Armour', helmet: 'Helmet', shield: 'Shield',
  miscellaneous: 'Misc', magic: 'Magic',
}

export default async function AdminEquipmentPage() {
  const supabase = await createClient()
  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .order('category')
    .order('name') as { data: Equipment[] | null }

  const byCategory = Object.entries(CATEGORY_LABELS).map(([cat, catLabel]) => ({
    cat, catLabel,
    items: (equipment ?? []).filter(e => e.category === cat),
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-cinzel text-2xl font-bold text-foreground">Equipment</h1>
        <Link
          href="/admin/equipment/new"
          className="px-4 py-2 text-sm border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 rounded transition-colors"
        >
          + New Item
        </Link>
      </div>

      {byCategory.map(({ cat, catLabel, items }) => (
        <section key={cat} className="space-y-2">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground/50">{catLabel}</h2>
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-card/60">
                <tr>
                  <th className="px-3 py-2 text-left text-xs text-muted-foreground font-normal">Name</th>
                  <th className="px-3 py-2 text-right text-xs text-muted-foreground font-normal">Cost</th>
                  <th className="px-3 py-2 text-right text-xs text-muted-foreground font-normal">Rarity</th>
                  <th className="px-3 py-2 text-left text-xs text-muted-foreground font-normal">Special Rules</th>
                  <th className="px-3 py-2 text-right text-xs text-muted-foreground font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(eq => (
                  <tr key={eq.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-3 py-2">
                      <Link href={`/admin/equipment/${eq.id}`} className="text-foreground hover:text-gold transition-colors">
                        {eq.name}
                        {eq.is_magic && <span className="ml-1 text-xs text-purple-400">✦</span>}
                      </Link>
                      {eq.description && (
                        <div className="text-xs text-muted-foreground/60 mt-0.5 truncate max-w-xs">{eq.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{eq.cost} gc</td>
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">{eq.rarity === 0 ? 'Common' : `${eq.rarity}+`}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground/60">{eq.special_rules.join(', ') || '—'}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/equipment/${eq.id}`} className="text-xs text-muted-foreground hover:text-foreground">Edit</Link>
                        <DeleteButton
                          action={deleteEquipment.bind(null, eq.id)}
                          confirmMessage={`Delete "${eq.name}"?`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
