import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteFaction } from '@/lib/admin/actions'
import { type Faction } from '@/types/database'

export const metadata = { title: 'Factions Admin' }

export default async function AdminFactionsPage() {
  const supabase = await createClient()
  const { data: factions } = await supabase
    .from('factions')
    .select('id, name, type, ruleset, alignment, starting_gold, is_enabled')
    .order('name') as { data: Pick<Faction, 'id' | 'name' | 'type' | 'ruleset' | 'alignment' | 'starting_gold' | 'is_enabled'>[] | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-cinzel text-2xl font-bold text-foreground">Factions</h1>
        <Link
          href="/admin/factions/new"
          className="px-4 py-2 text-sm border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 rounded transition-colors"
        >
          + New Faction
        </Link>
      </div>

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-card/60">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-normal uppercase tracking-wide">Name</th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-normal uppercase tracking-wide">Type</th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-normal uppercase tracking-wide">Ruleset</th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-normal uppercase tracking-wide">Alignment</th>
              <th className="px-4 py-2.5 text-right text-xs text-muted-foreground font-normal uppercase tracking-wide">Start GC</th>
              <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-normal uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 text-right text-xs text-muted-foreground font-normal uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(factions ?? []).map(f => (
              <tr key={f.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/factions/${f.id}`} className="text-foreground hover:text-gold transition-colors font-medium">
                    {f.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground capitalize">{f.type}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{f.ruleset}</td>
                <td className="px-4 py-2.5 text-muted-foreground capitalize">{f.alignment ?? '—'}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-right font-mono">{f.starting_gold}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${f.is_enabled ? 'text-emerald-400 border-emerald-600/30' : 'text-zinc-500 border-zinc-700/30'}`}>
                    {f.is_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/factions/${f.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteFaction.bind(null, f.id)}
                      confirmMessage={`Delete "${f.name}"? This will also delete all roster positions.`}
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
