import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EquipmentForm } from '@/components/admin/equipment-form'
import { updateEquipment } from '@/lib/admin/actions'
import { type Equipment } from '@/types/database'

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: equipment } = await supabase.from('equipment').select('*').eq('id', id).single() as { data: Equipment | null }
  if (!equipment) notFound()

  const boundUpdate = updateEquipment.bind(null, id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/equipment" className="text-xs text-muted-foreground hover:text-foreground">← Equipment</Link>
        <span className="text-muted-foreground/30">/</span>
        <h1 className="font-cinzel text-xl font-bold text-foreground">{equipment.name}</h1>
      </div>
      <EquipmentForm action={boundUpdate} initialData={equipment} submitLabel="Save Item" />
    </div>
  )
}
