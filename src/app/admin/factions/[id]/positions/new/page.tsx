import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PositionForm } from '@/components/admin/position-form'
import { createPosition } from '@/lib/admin/actions'
import { type Faction } from '@/types/database'

export default async function NewPositionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: faction } = await supabase.from('factions').select('id, name').eq('id', id).single() as { data: Pick<Faction, 'id' | 'name'> | null }
  if (!faction) notFound()

  const boundCreate = createPosition.bind(null, id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/factions" className="text-xs text-muted-foreground hover:text-foreground">← Factions</Link>
        <span className="text-muted-foreground/30">/</span>
        <Link href={`/admin/factions/${id}`} className="text-xs text-muted-foreground hover:text-foreground">{faction.name}</Link>
        <span className="text-muted-foreground/30">/</span>
        <h1 className="font-cinzel text-xl font-bold text-foreground">New Position</h1>
      </div>
      <PositionForm action={boundCreate} submitLabel="Create Position" />
    </div>
  )
}
