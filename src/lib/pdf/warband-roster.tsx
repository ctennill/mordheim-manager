import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { type Warband, type Warrior, type Faction } from '@/types/database'

type WarriorWithEquipment = Warrior & {
  warrior_equipment: { equipment: { name: string } | null }[]
}

interface WarbandRosterPdfProps {
  warband: Warband & { factions: Faction | null }
  warriors: WarriorWithEquipment[]
}

const STAT_KEYS: Array<{ label: string; key: keyof Warrior }> = [
  { label: 'M',  key: 'move' },
  { label: 'WS', key: 'weapon_skill' },
  { label: 'BS', key: 'ballistic_skill' },
  { label: 'S',  key: 'strength' },
  { label: 'T',  key: 'toughness' },
  { label: 'W',  key: 'wounds' },
  { label: 'I',  key: 'initiative' },
  { label: 'A',  key: 'attacks' },
  { label: 'Ld', key: 'leadership' },
]

const s = StyleSheet.create({
  page: { padding: 32, fontFamily: 'Helvetica', backgroundColor: '#ffffff', fontSize: 9, color: '#1a1a1a' },
  // Header
  header: { borderBottom: '2pt solid #1a1a1a', paddingBottom: 8, marginBottom: 12 },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  subtitle: { fontSize: 9, color: '#555', flexDirection: 'row', gap: 8 },
  subtitleItem: { marginRight: 12 },
  // Section
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1pt solid #ccc', paddingBottom: 3, marginBottom: 6, marginTop: 14 },
  // Warrior card
  warriorCard: { borderBottom: '0.5pt solid #ddd', paddingBottom: 8, marginBottom: 8 },
  warriorName: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  warriorMeta: { fontSize: 8, color: '#666', marginBottom: 4 },
  // Stat row
  statRow: { flexDirection: 'row', borderWidth: '0.5pt', borderColor: '#999', borderRadius: 2, overflow: 'hidden', marginBottom: 3 },
  statCell: { flex: 1, alignItems: 'center', borderRight: '0.5pt solid #ccc', padding: '2pt 0' },
  statCellLast: { flex: 1, alignItems: 'center', padding: '2pt 0' },
  statLabel: { fontSize: 6.5, color: '#888', textTransform: 'uppercase', marginBottom: 1 },
  statValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  // Details
  detailLine: { fontSize: 8, color: '#444', marginTop: 2 },
  detailBold: { fontFamily: 'Helvetica-Bold' },
  // Footer
  footer: { position: 'absolute', bottom: 20, left: 32, right: 32, borderTop: '0.5pt solid #ddd', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#aaa' },
  // Status badge
  statusBadge: { fontSize: 7, color: '#888', marginLeft: 6 },
})

function StatBlock({ warrior }: { warrior: Warrior }) {
  return (
    <View style={s.statRow}>
      {STAT_KEYS.map(({ label, key }, i) => (
        <View key={label} style={i === STAT_KEYS.length - 1 ? s.statCellLast : s.statCell}>
          <Text style={s.statLabel}>{label}</Text>
          <Text style={s.statValue}>{warrior[key] as number}</Text>
        </View>
      ))}
    </View>
  )
}

export function WarbandRosterPdf({ warband, warriors }: WarbandRosterPdfProps) {
  const heroes = warriors.filter((w) => w.warrior_type === 'hero' && w.status !== 'dead')
  const henchmen = warriors.filter((w) => w.warrior_type === 'henchman' && w.status !== 'dead')

  const record = `${warband.wins}W / ${warband.draws}D / ${warband.losses}L`
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <Document title={`${warband.name} — Roster`} author="Mordheim Manager">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>{warband.name}</Text>
          <View style={s.subtitle}>
            <Text style={s.subtitleItem}>{warband.factions?.name ?? 'Unknown Faction'}</Text>
            <Text style={s.subtitleItem}>·</Text>
            <Text style={s.subtitleItem}>{record}</Text>
            <Text style={s.subtitleItem}>·</Text>
            <Text style={s.subtitleItem}>Treasury: {warband.treasury} gc</Text>
            <Text style={s.subtitleItem}>·</Text>
            <Text style={s.subtitleItem}>Warband Rating: {warband.warband_rating}</Text>
          </View>
        </View>

        {/* Heroes */}
        {heroes.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Heroes</Text>
            {heroes.map((w) => {
              const equipment = w.warrior_equipment.map((we) => we.equipment?.name).filter(Boolean)
              return (
                <View key={w.id} style={s.warriorCard} wrap={false}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={s.warriorName}>{w.name ?? 'Unnamed Hero'}</Text>
                    {w.status !== 'active' && (
                      <Text style={s.statusBadge}>({w.status})</Text>
                    )}
                    <Text style={{ flex: 1 }} />
                    <Text style={{ fontSize: 8, color: '#666' }}>{w.experience} XP</Text>
                  </View>
                  <StatBlock warrior={w} />
                  {w.skills.length > 0 && (
                    <Text style={s.detailLine}>
                      <Text style={s.detailBold}>Skills: </Text>
                      {w.skills.join(', ')}
                    </Text>
                  )}
                  {equipment.length > 0 && (
                    <Text style={s.detailLine}>
                      <Text style={s.detailBold}>Equipment: </Text>
                      {equipment.join(', ')}
                    </Text>
                  )}
                  {w.special_rules.length > 0 && (
                    <Text style={s.detailLine}>
                      <Text style={s.detailBold}>Special: </Text>
                      {w.special_rules.join(', ')}
                    </Text>
                  )}
                </View>
              )
            })}
          </>
        )}

        {/* Henchmen */}
        {henchmen.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Henchmen</Text>
            {henchmen.map((w) => {
              const equipment = w.warrior_equipment.map((we) => we.equipment?.name).filter(Boolean)
              return (
                <View key={w.id} style={s.warriorCard} wrap={false}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={s.warriorName}>
                      {w.name ?? 'Henchmen'}{w.group_count > 1 ? ` ×${w.group_count}` : ''}
                    </Text>
                    <Text style={{ flex: 1 }} />
                    <Text style={{ fontSize: 8, color: '#666' }}>{w.experience} XP</Text>
                  </View>
                  <StatBlock warrior={w} />
                  {equipment.length > 0 && (
                    <Text style={s.detailLine}>
                      <Text style={s.detailBold}>Equipment: </Text>
                      {equipment.join(', ')}
                    </Text>
                  )}
                </View>
              )
            })}
          </>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{warband.name} — Mordheim Manager</Text>
          <Text style={s.footerText}>{date}</Text>
        </View>
      </Page>
    </Document>
  )
}
