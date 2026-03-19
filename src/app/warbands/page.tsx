import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { type Warband, type Faction } from '@/types/database'
import { getFactionTheme } from '@/lib/faction-theme'

export const metadata: Metadata = { title: 'My Warbands' }

export default async function WarbandsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('warbands')
    .select('*, factions(name)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const warbands = (data ?? []) as (Warband & { factions: Pick<Faction, 'name'> })[]

  return (
    <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-gold"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            My Warbands
          </h1>
          <p className="text-muted-foreground mt-1">Build and manage your warbands</p>
        </div>
        <Link
          href="/warbands/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-colors"
        >
          + New Warband
        </Link>
      </div>

      {warbands.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center space-y-4">
          <p className="text-muted-foreground">You have no warbands yet.</p>
          <Link
            href="/warbands/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-colors"
          >
            Build Your First Warband
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {warbands.map((wb) => {
            const theme = getFactionTheme(wb.factions?.name ?? '')
            return (
              <Link
                key={wb.id}
                href={`/warbands/${wb.id}`}
                className={`block rounded-md border bg-card p-5 space-y-3 transition-colors ${theme.borderClass} ${theme.bgClass}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{theme.icon}</span>
                  <h3
                    className={`font-bold ${theme.accentClass}`}
                    style={{ fontFamily: 'var(--font-cinzel), serif' }}
                  >
                    {wb.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{wb.factions?.name}</span>
                  <span>·</span>
                  <span>WR {wb.warband_rating}</span>
                  <span>·</span>
                  <span>{wb.treasury} gc</span>
                </div>
                <span className={`inline-block text-[10px] border rounded px-1.5 py-0.5 capitalize ${
                  wb.status === 'active' ? 'border-emerald-400/40 text-emerald-400' :
                  wb.status === 'draft'  ? 'border-border text-muted-foreground' :
                  'border-border text-muted-foreground'
                }`}>
                  {wb.status}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
