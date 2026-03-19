import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { type Battle, type Warband } from '@/types/database'

interface BattleReportPdfProps {
  battle: Battle
  warbandA: Pick<Warband, 'id' | 'name'>
  warbandB: Pick<Warband, 'id' | 'name'>
  scenarioName: string | null
  campaignName: string | null
  warriorResults: {
    warbandId: string
    warriorName: string
    warriorType: string
    wentOoa: boolean
    injuryResult: string | null
    xpGained: number
  }[]
}

const RESULT_LABEL: Record<string, string> = { win: 'WIN', loss: 'LOSS', draw: 'DRAW' }

const s = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a1a', backgroundColor: '#fff' },
  header: { borderBottom: '2pt solid #1a1a1a', paddingBottom: 10, marginBottom: 14 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  meta: { fontSize: 8, color: '#666' },
  // Matchup
  matchup: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  warbandBox: { flex: 1, borderWidth: '1pt', borderColor: '#ccc', borderRadius: 3, padding: 10, alignItems: 'center' },
  warbandName: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4, textAlign: 'center' },
  resultBadge: { fontSize: 10, fontFamily: 'Helvetica-Bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2 },
  win: { color: '#166534', backgroundColor: '#dcfce7' },
  loss: { color: '#991b1b', backgroundColor: '#fee2e2' },
  draw: { color: '#92400e', backgroundColor: '#fef3c7' },
  vs: { fontSize: 14, color: '#aaa', fontFamily: 'Helvetica-Bold', textAlign: 'center', width: 30 },
  statLine: { fontSize: 8, color: '#666', marginTop: 2 },
  // Section
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, color: '#555', borderBottom: '0.5pt solid #ddd', paddingBottom: 3, marginBottom: 6, marginTop: 12 },
  // Table
  tableRow: { flexDirection: 'row', paddingVertical: 3, borderBottom: '0.5pt solid #eee' },
  tableHeader: { flexDirection: 'row', paddingVertical: 3, borderBottom: '1pt solid #ccc', marginBottom: 2 },
  col1: { flex: 2.5 },
  col2: { flex: 1 },
  col3: { flex: 2 },
  col4: { flex: 0.8, textAlign: 'right' },
  headerText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#555', textTransform: 'uppercase' },
  cellText: { fontSize: 8 },
  ooa: { color: '#b91c1c' },
  footer: { position: 'absolute', bottom: 20, left: 36, right: 36, borderTop: '0.5pt solid #ddd', paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#aaa' },
})

export function BattleReportPdf({ battle, warbandA, warbandB, scenarioName, campaignName, warriorResults }: BattleReportPdfProps) {
  const date = battle.played_at
    ? new Date(battle.played_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Date unknown'

  const resultsA = warriorResults.filter((r) => r.warbandId === battle.warband_a_id)
  const resultsB = warriorResults.filter((r) => r.warbandId === battle.warband_b_id)

  function WarbandResults({ results }: { results: typeof warriorResults }) {
    if (results.length === 0) return <Text style={{ fontSize: 8, color: '#aaa' }}>No warrior results recorded.</Text>
    return (
      <>
        <View style={s.tableHeader}>
          <Text style={[s.col1, s.headerText]}>Warrior</Text>
          <Text style={[s.col2, s.headerText]}>Type</Text>
          <Text style={[s.col3, s.headerText]}>Injury</Text>
          <Text style={[s.col4, s.headerText]}>XP</Text>
        </View>
        {results.map((r, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={[s.col1, s.cellText, r.wentOoa ? s.ooa : {}]}>{r.warriorName}{r.wentOoa ? ' (OOA)' : ''}</Text>
            <Text style={[s.col2, s.cellText]}>{r.warriorType}</Text>
            <Text style={[s.col3, s.cellText]}>{r.injuryResult ?? '—'}</Text>
            <Text style={[s.col4, s.cellText]}>+{r.xpGained}</Text>
          </View>
        ))}
      </>
    )
  }

  return (
    <Document title="Battle Report — Mordheim Manager" author="Mordheim Manager">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Battle Report</Text>
          <Text style={s.meta}>
            {date}{campaignName ? ` · ${campaignName}` : ''}{scenarioName ? ` · ${scenarioName}` : ''}
          </Text>
        </View>

        {/* Matchup */}
        <View style={s.matchup}>
          <View style={s.warbandBox}>
            <Text style={s.warbandName}>{warbandA.name}</Text>
            {battle.result_a && (
              <Text style={[s.resultBadge, s[battle.result_a as 'win' | 'loss' | 'draw'] ?? {}]}>
                {RESULT_LABEL[battle.result_a]}
              </Text>
            )}
            <Text style={s.statLine}>{battle.wyrdstone_a} wyrdstone{battle.warband_a_routed ? ' · Routed' : ''}</Text>
          </View>
          <Text style={s.vs}>VS</Text>
          <View style={s.warbandBox}>
            <Text style={s.warbandName}>{warbandB.name}</Text>
            {battle.result_b && (
              <Text style={[s.resultBadge, s[battle.result_b as 'win' | 'loss' | 'draw'] ?? {}]}>
                {RESULT_LABEL[battle.result_b]}
              </Text>
            )}
            <Text style={s.statLine}>{battle.wyrdstone_b} wyrdstone{battle.warband_b_routed ? ' · Routed' : ''}</Text>
          </View>
        </View>

        {/* Results — Warband A */}
        <Text style={s.sectionTitle}>{warbandA.name} — Warrior Results</Text>
        <WarbandResults results={resultsA} />

        {/* Results — Warband B */}
        <Text style={s.sectionTitle}>{warbandB.name} — Warrior Results</Text>
        <WarbandResults results={resultsB} />

        {/* Notes */}
        {battle.notes && (
          <>
            <Text style={s.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 8 }}>{battle.notes}</Text>
          </>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Mordheim Manager — Battle Report</Text>
          <Text style={s.footerText}>{date}</Text>
        </View>
      </Page>
    </Document>
  )
}
