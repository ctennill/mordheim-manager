import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { type Warband, type Warrior, type Faction } from '@/types/database'
import { getFactionTheme } from '@/lib/faction-theme'
import { WarbandTerritories } from '@/components/territory/warband-territories'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('warbands').select('name').eq('id', id).single() as { data: { name: string } | null }
  return { title: data?.name ?? 'Warband' }
}

export default async function WarbandPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [warbandRes, warriorsRes] = await Promise.all([
    supabase
      .from('warbands')
      .select('*, factions(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('warriors')
      .select('*, warrior_equipment(*, equipment(*))')
      .eq('warband_id', id)
      .order('warrior_type')
      .order('created_at'),
  ])

  const warband = warbandRes.data as (Warband & { factions: Faction }) | null
  if (!warband) notFound()

  const warriors = (warriorsRes.data ?? []) as Warrior[]
  const theme = getFactionTheme(warband.factions?.name ?? '')

  const heroes = warriors.filter((w) => w.warrior_type === 'hero')
  const henchmen = warriors.filter((w) => w.warrior_type === 'henchman')

  const STAT_LABELS = ['M', 'WS', 'BS', 'S', 'T', 'W', 'I', 'A', 'Ld']

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">

      <Link href="/warbands" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← My Warbands
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1
              className={`text-3xl font-bold ${theme.accentClass}`}
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              {warband.name}
            </h1>
            {warband.motto && (
              <p className="text-sm text-muted-foreground italic">"{warband.motto}"</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs border rounded px-2 py-1 ${theme.borderClass} ${theme.accentClass}`}>
              {theme.icon} {warband.factions?.name}
            </span>
            <span className="text-xs border border-border rounded px-2 py-1 text-muted-foreground capitalize">
              {warband.status}
            </span>
            <Link
              href={`/warbands/${id}/print`}
              className="text-xs border border-border rounded px-2 py-1 text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors"
            >
              Print Roster
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Warband Rating', value: warband.warband_rating },
            { label: 'Treasury', value: `${warband.treasury} gc` },
            { label: 'Models', value: warriors.reduce((s, w) => s + w.group_count, 0) },
            { label: 'Record', value: `${warband.wins}W ${warband.losses}L ${warband.draws}D` },
          ].map((s) => (
            <div key={s.label} className="rounded border border-border bg-card p-3 text-center">
              <div className={`text-lg font-bold ${theme.accentClass}`}>{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Heroes */}
      {heroes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground/60">Heroes</h2>
          <div className="space-y-3">
            {heroes.map((warrior) => {
              const stats = [warrior.move, warrior.weapon_skill, warrior.ballistic_skill,
                warrior.strength, warrior.toughness, warrior.wounds,
                warrior.initiative, warrior.attacks, warrior.leadership]
              return (
                <div key={warrior.id} className="rounded-md border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground">
                        {warrior.name ?? 'Unnamed'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">Hero</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`border rounded px-1.5 py-0.5 ${
                        warrior.status === 'active' ? 'status-active border' : 'border-border'
                      }`}>{warrior.status}</span>
                      <span>{warrior.experience} XP</span>
                    </div>
                  </div>
                  <div className="flex gap-0 border border-border rounded overflow-hidden text-xs font-mono">
                    {STAT_LABELS.map((label, i) => (
                      <div key={label} className="flex-1 flex flex-col items-center py-1 border-r border-border last:border-r-0">
                        <span className="text-[9px] text-muted-foreground uppercase">{label}</span>
                        <span className="font-bold text-foreground">{stats[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Henchmen */}
      {henchmen.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground/60">Henchmen</h2>
          <div className="space-y-3">
            {henchmen.map((warrior) => {
              const stats = [warrior.move, warrior.weapon_skill, warrior.ballistic_skill,
                warrior.strength, warrior.toughness, warrior.wounds,
                warrior.initiative, warrior.attacks, warrior.leadership]
              return (
                <div key={warrior.id} className="rounded-md border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground">Henchmen</span>
                      <span className="text-xs text-muted-foreground ml-2">×{warrior.group_count}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{warrior.experience} XP</span>
                  </div>
                  <div className="flex gap-0 border border-border rounded overflow-hidden text-xs font-mono">
                    {STAT_LABELS.map((label, i) => (
                      <div key={label} className="flex-1 flex flex-col items-center py-1 border-r border-border last:border-r-0">
                        <span className="text-[9px] text-muted-foreground uppercase">{label}</span>
                        <span className="font-bold text-foreground">{stats[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Territories */}
      {warband.campaign_id && (
        <section className="space-y-3">
          <WarbandTerritories
            warbandId={warband.id}
            campaignId={warband.campaign_id}
            isOwner={warband.owner_id === user.id}
            isCommissioner={false}
          />
        </section>
      )}
    </main>
  )
}
