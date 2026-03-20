import Link from 'next/link'
import { EquipmentForm } from '@/components/admin/equipment-form'
import { createEquipment } from '@/lib/admin/actions'

export const metadata = { title: 'New Equipment — Admin' }

export default function NewEquipmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/equipment" className="text-xs text-muted-foreground hover:text-foreground">← Equipment</Link>
        <span className="text-muted-foreground/30">/</span>
        <h1 className="font-cinzel text-xl font-bold text-foreground">New Equipment</h1>
      </div>
      <EquipmentForm action={createEquipment} submitLabel="Create Item" />
    </div>
  )
}
