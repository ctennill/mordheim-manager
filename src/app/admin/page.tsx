import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const [factions, equipment, positions] = await Promise.all([
    supabase.from('factions').select('id', { count: 'exact', head: true }),
    supabase.from('equipment').select('id', { count: 'exact', head: true }),
    supabase.from('faction_positions').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Factions', count: factions.count ?? 0, href: '/admin/factions' },
    { label: 'Positions', count: positions.count ?? 0, href: '/admin/factions' },
    { label: 'Equipment', count: equipment.count ?? 0, href: '/admin/equipment' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-cinzel text-2xl font-bold text-foreground">Game Data Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage factions, roster positions, and equipment.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="p-5 border border-border rounded bg-card hover:border-gold/40 transition-colors">
            <div className="text-3xl font-bold font-cinzel text-gold">{s.count}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/factions/new" className="p-4 border border-dashed border-border rounded hover:border-gold/40 text-sm text-muted-foreground hover:text-foreground transition-colors">
          + New Faction
        </Link>
        <Link href="/admin/equipment/new" className="p-4 border border-dashed border-border rounded hover:border-gold/40 text-sm text-muted-foreground hover:text-foreground transition-colors">
          + New Equipment Item
        </Link>
      </div>
    </div>
  )
}
