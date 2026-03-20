import Link from 'next/link'
import { FactionForm } from '@/components/admin/faction-form'
import { createFaction } from '@/lib/admin/actions'

export const metadata = { title: 'New Faction — Admin' }

export default function NewFactionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/factions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Factions</Link>
        <span className="text-muted-foreground/30">/</span>
        <h1 className="font-cinzel text-xl font-bold text-foreground">New Faction</h1>
      </div>
      <FactionForm action={createFaction} submitLabel="Create Faction" />
    </div>
  )
}
