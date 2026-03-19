import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { type Faction, type FactionType } from '@/types/database'
import { FactionCard } from '@/components/warband/faction-card'
import { FactionFilter } from '@/components/warband/faction-filter'

export const metadata: Metadata = { title: 'Factions' }

interface PageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function FactionsPage({ searchParams }: PageProps) {
  const { type } = await searchParams
  const supabase = await createClient()

  const query = supabase
    .from('factions')
    .select('*')
    .eq('is_enabled', true)
    .order('name')

  if (type && type !== 'all') {
    query.eq('type', type as FactionType)
  }

  const { data: factions, error } = await query as { data: Faction[] | null; error: unknown }

  return (
    <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1
          className="text-3xl font-bold text-gold"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          Factions
        </h1>
        <p className="text-muted-foreground">
          Choose your warband faction. Each brings unique warriors, special rules, and playstyle.
        </p>
      </div>

      {/* Filter */}
      <Suspense fallback={null}>
        <FactionFilter />
      </Suspense>

      {/* Grid */}
      {error ? (
        <p className="text-destructive text-sm">Failed to load factions. Check your Supabase connection.</p>
      ) : !factions || factions.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-8 text-center text-muted-foreground">
          <p>No factions found.</p>
          <p className="text-sm mt-1">Run migration 003_seed_game_data.sql in Supabase to seed faction data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {factions.map((faction) => (
            <FactionCard key={faction.id} faction={faction} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground/40">
        {factions?.length ?? 0} faction{factions?.length !== 1 ? 's' : ''} available
      </p>
    </main>
  )
}
