import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type Warband, type Warrior, type Faction } from '@/types/database'
import { PrintButton } from '@/components/warband/print-button'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('warbands').select('name').eq('id', id).single() as { data: { name: string } | null }
  return { title: data ? `${data.name} — Roster` : 'Warband Roster' }
}

const STAT_LABELS = ['M', 'WS', 'BS', 'S', 'T', 'W', 'I', 'A', 'Ld']

export default async function WarbandPrintPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [warbandRes, warriorsRes] = await Promise.all([
    supabase.from('warbands').select('*, factions(*)').eq('id', id).single(),
    supabase
      .from('warriors')
      .select('*, warrior_equipment(*, equipment(*))')
      .eq('warband_id', id)
      .order('warrior_type')
      .order('created_at'),
  ])

  const warband = warbandRes.data as (Warband & { factions: Faction | null }) | null
  if (!warband) notFound()

  const warriors = (warriorsRes.data ?? []) as (Warrior & {
    warrior_equipment: { id: string; equipment: { name: string; category: string } | null }[]
  })[]

  const heroes = warriors.filter((w) => w.warrior_type === 'hero')
  const henchmen = warriors.filter((w) => w.warrior_type === 'henchman')

  function StatTable({ warrior }: { warrior: Warrior }) {
    const stats = [
      warrior.move, warrior.weapon_skill, warrior.ballistic_skill,
      warrior.strength, warrior.toughness, warrior.wounds,
      warrior.initiative, warrior.attacks, warrior.leadership,
    ]
    return (
      <div className="flex border border-border/60 rounded overflow-hidden text-xs font-mono print:border-black/30">
        {STAT_LABELS.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center py-1 border-r border-border/60 last:border-r-0 print:border-black/30">
            <span className="text-[9px] text-muted-foreground uppercase print:text-black/60">{label}</span>
            <span className="font-bold text-foreground print:text-black">{stats[i]}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 print:px-0 print:py-0 print:space-y-6">
      {/* Print controls — hidden on print */}
      <div className="flex items-center justify-between no-print">
        <a
          href={`/warbands/${id}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Warband
        </a>
        <PrintButton />
      </div>

      {/* Header */}
      <header className="border-b border-border pb-6 print:border-black/30 print:pb-4">
        <h1 className="font-cinzel text-3xl font-bold text-foreground print:text-black">
          {warband.name}
        </h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground print:text-black/70">
          <span>{warband.factions?.name ?? 'Unknown Faction'}</span>
          <span>·</span>
          <span>{warband.wins}W / {warband.draws}D / {warband.losses}L</span>
          <span>·</span>
          <span>Treasury: {warband.treasury} gc</span>
          <span>·</span>
          <span>Rating: {warband.warband_rating}</span>
        </div>
      </header>

      {/* Heroes */}
      {heroes.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-cinzel text-lg font-semibold text-foreground uppercase tracking-wide print:text-black">
            Heroes
          </h2>
          <div className="space-y-4">
            {heroes.map((warrior) => {
              const equipment = warrior.warrior_equipment
                .map((we) => we.equipment?.name)
                .filter(Boolean)
              return (
                <div key={warrior.id} className="border border-border rounded p-4 space-y-2 print:border-black/30 print:break-inside-avoid">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground print:text-black">
                        {warrior.name ?? 'Unnamed Hero'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2 capitalize print:text-black/60">
                        {warrior.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground print:text-black/60">
                      {warrior.experience} XP
                    </span>
                  </div>
                  <StatTable warrior={warrior} />
                  {warrior.skills.length > 0 && (
                    <p className="text-xs text-muted-foreground print:text-black/70">
                      <span className="font-medium">Skills:</span> {warrior.skills.join(', ')}
                    </p>
                  )}
                  {equipment.length > 0 && (
                    <p className="text-xs text-muted-foreground print:text-black/70">
                      <span className="font-medium">Equipment:</span> {equipment.join(', ')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Henchmen */}
      {henchmen.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-cinzel text-lg font-semibold text-foreground uppercase tracking-wide print:text-black">
            Henchmen
          </h2>
          <div className="space-y-4">
            {henchmen.map((warrior) => {
              const equipment = warrior.warrior_equipment
                .map((we) => we.equipment?.name)
                .filter(Boolean)
              return (
                <div key={warrior.id} className="border border-border rounded p-4 space-y-2 print:border-black/30 print:break-inside-avoid">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground print:text-black">
                        Henchmen
                      </span>
                      <span className="text-xs text-muted-foreground ml-2 print:text-black/60">
                        ×{warrior.group_count}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground print:text-black/60">
                      {warrior.experience} XP
                    </span>
                  </div>
                  <StatTable warrior={warrior} />
                  {equipment.length > 0 && (
                    <p className="text-xs text-muted-foreground print:text-black/70">
                      <span className="font-medium">Equipment:</span> {equipment.join(', ')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="pt-6 border-t border-border text-xs text-muted-foreground text-center print:border-black/30 print:text-black/50">
        Generated by Mordheim Manager
      </footer>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
