import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PositionForm } from '@/components/admin/position-form'
import { updatePosition } from '@/lib/admin/actions'
import { type Faction, type FactionPosition } from '@/types/database'

export default async function EditPositionPage({ params }: { params: Promise<{ id: string; posId: string }> }) {
  const { id, posId } = await params
  const supabase = await createClient()

  const [factionRes, posRes] = await Promise.all([
    (supabase.from('factions').select('id, name').eq('id', id).single()) as unknown as Promise<{ data: Pick<Faction, 'id' | 'name'> | null }>,
    (supabase.from('faction_positions').select('*').eq('id', posId).single()) as unknown as Promise<{ data: FactionPosition | null }>,
  ])

  if (!factionRes.data || !posRes.data) notFound()
  const faction = factionRes.data
  const position = posRes.data

  const boundUpdate = updatePosition.bind(null, id, posId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/factions" className="text-xs text-muted-foreground hover:text-foreground">← Factions</Link>
        <span className="text-muted-foreground/30">/</span>
        <Link href={`/admin/factions/${id}`} className="text-xs text-muted-foreground hover:text-foreground">{faction.name}</Link>
        <span className="text-muted-foreground/30">/</span>
        <h1 className="font-cinzel text-xl font-bold text-foreground">{position.name}</h1>
      </div>
      <PositionForm action={boundUpdate} initialData={position} submitLabel="Save Position" />
    </div>
  )
}
