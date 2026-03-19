import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { type Faction, type FactionPosition, type Equipment } from '@/types/database'
import { FactionRosterTable } from '@/components/warband/faction-roster-table'
import { getFactionTheme, ALIGNMENT_LABELS } from '@/lib/faction-theme'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('factions').select('name').eq('id', id).single() as { data: { name: string } | null }
  return { title: data?.name ?? 'Faction' }
}

export default async function FactionDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch faction, positions, and available equipment in parallel
  const [factionRes, positionsRes, equipmentRes] = await Promise.all([
    supabase.from('factions').select('*').eq('id', id).single(),
    supabase.from('faction_positions').select('*').eq('faction_id', id).order('sort_order'),
    supabase
      .from('faction_equipment')
      .select('equipment_id, is_faction_specific, equipment(*)')
      .eq('faction_id', id),
  ])

  const faction = factionRes.data as Faction | null
  if (!faction) notFound()

  const positions = (positionsRes.data ?? []) as FactionPosition[]
  const equipmentRows = (equipmentRes.data ?? []) as Array<{
    equipment_id: string
    is_faction_specific: boolean
    equipment: Equipment
  }>

  const theme = getFactionTheme(faction.name)
  const alignmentStyle = faction.alignment ? ALIGNMENT_LABELS[faction.alignment] : null

  // Group equipment by category
  const equipmentByCategory = equipmentRows.reduce<Record<string, Array<Equipment & { faction_specific: boolean }>>>(
    (acc, row) => {
      if (!row.equipment) return acc
      const cat = row.equipment.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push({ ...row.equipment, faction_specific: row.is_faction_specific })
      return acc
    },
    {}
  )

  const CATEGORY_LABELS: Record<string, string> = {
    hand_weapon:  'Hand Weapons',
    two_handed:   'Two-Handed Weapons',
    missile:      'Missile Weapons',
    armor:        'Armour',
    helmet:       'Helmets',
    shield:       'Shields',
    miscellaneous:'Miscellaneous',
    magic:        'Magic Items',
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-10">

      {/* Back nav */}
      <Link
        href="/factions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← All Factions
      </Link>

      {/* Hero header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{theme.icon}</span>
          <div>
            <h1
              className={`text-4xl font-bold ${theme.accentClass}`}
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              {faction.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-block px-2 py-0.5 rounded text-xs border border-border text-muted-foreground capitalize">
                {faction.type}
              </span>
              <span className="inline-block px-2 py-0.5 rounded text-xs border border-border text-muted-foreground capitalize">
                {faction.ruleset === 'town_cryer' ? 'Town Cryer' : faction.ruleset === 'community' ? 'Community Edition' : 'Core'}
              </span>
              {alignmentStyle && (
                <span className={`inline-block px-2 py-0.5 rounded text-xs border ${alignmentStyle.className}`}>
                  {alignmentStyle.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lore */}
        {faction.lore && (
          <p className="text-muted-foreground leading-relaxed border-l-2 border-border pl-4 italic">
            {faction.lore}
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-md border p-4 bg-card ${theme.borderClass}`}>
        <Stat label="Starting Gold" value={`${faction.starting_gold} gc`} accent={theme.accentClass} />
        <Stat label="Min. Models" value={String(faction.min_warband_size)} accent={theme.accentClass} />
        <Stat label="Max. Models" value={String(faction.max_warband_size)} accent={theme.accentClass} />
        <Stat label="Alignment" value={faction.alignment ? faction.alignment.charAt(0).toUpperCase() + faction.alignment.slice(1) : 'Any'} accent={theme.accentClass} />
      </div>

      {/* Special rules */}
      {faction.special_rules.length > 0 && (
        <section className="space-y-3">
          <SectionHeading>Special Rules</SectionHeading>
          <ul className="space-y-2">
            {faction.special_rules.map((rule, i) => {
              const [title, ...rest] = rule.split(':')
              return (
                <li key={i} className="flex gap-3">
                  <span className={`mt-0.5 shrink-0 font-bold ${theme.accentClass}`}>▸</span>
                  <span className="text-sm text-foreground">
                    <span className="font-semibold">{title}</span>
                    {rest.length > 0 && (
                      <span className="text-muted-foreground">: {rest.join(':')}</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Roster table */}
      {positions.length > 0 && (
        <section className="space-y-3">
          <SectionHeading>Roster</SectionHeading>
          <div className="rounded-md border border-border bg-card p-4">
            <FactionRosterTable positions={positions} />
          </div>
        </section>
      )}

      {/* Equipment availability */}
      {Object.keys(equipmentByCategory).length > 0 && (
        <section className="space-y-3">
          <SectionHeading>Equipment Availability</SectionHeading>
          <div className="rounded-md border border-border bg-card p-4 space-y-6">
            {Object.entries(equipmentByCategory).map(([cat, items]) => (
              <div key={cat}>
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {CATEGORY_LABELS[cat] ?? cat}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
                      <span className="flex items-center gap-1.5">
                        {item.faction_specific && (
                          <span className={`text-[10px] ${theme.accentClass}`} title="Faction-specific item">★</span>
                        )}
                        <span className="text-foreground">{item.name}</span>
                        {item.rarity > 0 && (
                          <span className="text-[10px] text-muted-foreground/60">(Rare {item.rarity})</span>
                        )}
                      </span>
                      <span className="text-gold font-medium ml-4 shrink-0">{item.cost} gc</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="flex gap-3 pt-2">
        <Link
          href={`/warbands/new?faction=${faction.id}`}
          className={`inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/80`}
        >
          Build a {faction.name} Warband →
        </Link>
        <Link
          href="/factions"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          Back to Factions
        </Link>
      </div>

    </main>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-semibold text-foreground border-b border-border pb-2"
      style={{ fontFamily: 'var(--font-cinzel), serif' }}
    >
      {children}
    </h2>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}
