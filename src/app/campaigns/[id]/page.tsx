import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from "@/lib/supabase/server"
import { type Campaign, type CampaignPlayer } from '@/types/database'

type PlayerRow = CampaignPlayer & {
  profiles: { display_name: string | null; username: string } | null
  warbands: { name: string; warband_rating: number; wins: number; losses: number; draws: number } | null
}

type CampaignRow = Campaign & { campaign_players: PlayerRow[] }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('campaigns').select('name').eq('id', id).single() as { data: { name: string } | null }
  return { title: data ? `${data.name} — Mordheim Manager` : 'Campaign — Mordheim Manager' }
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'text-zinc-400 border-zinc-600/40',
  registration: 'text-amber-400 border-amber-400/40',
  active: 'text-emerald-400 border-emerald-400/40',
  completed: 'text-blue-400 border-blue-400/40',
  archived: 'text-zinc-500 border-zinc-600/30',
}

const MODE_LABELS: Record<string, string> = {
  standard: 'Standard', open: 'Open', event: 'Event', solo: 'Solo',
}

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_players(
        id, player_id, warband_id, is_commissioner, joined_at, approval_status,
        profiles:player_id(display_name, username),
        warbands:warband_id(name, warband_rating, wins, losses, draws)
      )
    `)
    .eq('id', id)
    .single() as { data: CampaignRow | null }

  if (!campaign) notFound()

  // Visibility check
  const isCommissioner = campaign.commissioner_id === user?.id
  const isParticipant = campaign.campaign_players.some(
    (p) => p.player_id === user?.id && p.approval_status === 'approved'
  )
  if (campaign.privacy === 'private' && !isCommissioner && !isParticipant) {
    notFound()
  }

  const approvedPlayers = campaign.campaign_players.filter((p) => p.approval_status === 'approved')
  const pendingPlayers = campaign.campaign_players.filter((p) => p.approval_status === 'pending')

  const statusStyle = STATUS_STYLES[campaign.status] ?? 'text-muted-foreground border-border'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-cinzel text-2xl font-bold text-foreground">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded border capitalize ${statusStyle}`}>
                {campaign.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {MODE_LABELS[campaign.mode] ?? campaign.mode}
              </span>
              {campaign.location && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground">{campaign.location}</span>
                </>
              )}
            </div>
          </div>

          {isCommissioner && (
            <Link
              href={`/campaigns/${id}/settings`}
              className="px-3 py-1.5 text-xs rounded border border-border hover:border-gold/40 text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </Link>
          )}
        </div>

        {campaign.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{campaign.description}</p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Players" value={`${approvedPlayers.length} / ${campaign.max_warbands}`} />
          <Stat
            label="Sessions"
            value={campaign.total_sessions ? `${campaign.current_session} / ${campaign.total_sessions}` : `${campaign.current_session} (open)`}
          />
          <Stat label="Scoring" value={`W${campaign.points_win} D${campaign.points_draw} L${campaign.points_loss}`} />
          <Stat label="Starting Gold" value={`${campaign.starting_gold} gc`} />
        </div>
      </div>

      {/* Standings / Roster */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Standings</h2>
          <Link
            href={`/campaigns/${id}/standings`}
            className="text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            Full Standings →
          </Link>
        </div>
        {approvedPlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved warbands yet.</p>
        ) : (
          <div className="rounded-md border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {['#', 'Warband', 'Player', 'GP', 'W', 'D', 'L', 'VP', 'Rating'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium text-left first:pl-4 last:pr-4 last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {approvedPlayers
                  .filter((p) => p.warbands)
                  .map((p) => {
                    const wb = p.warbands!
                    const gp = (wb.wins ?? 0) + (wb.draws ?? 0) + (wb.losses ?? 0)
                    const vp = (wb.wins ?? 0) * campaign.points_win + (wb.draws ?? 0) * campaign.points_draw + (wb.losses ?? 0) * campaign.points_loss
                    return { p, wb, gp, vp }
                  })
                  .sort((a, b) => b.vp - a.vp || b.wb.warband_rating - a.wb.warband_rating)
                  .map(({ p, wb, gp, vp }, idx) => (
                    <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                      <td className="pl-4 pr-3 py-3 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <Link href={`/warbands/${p.warband_id}`} className="text-foreground hover:text-gold transition-colors">
                          {wb.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {p.profiles?.display_name ?? p.profiles?.username ?? 'Unknown'}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{gp}</td>
                      <td className="px-3 py-3 font-mono text-xs text-emerald-400">{wb.wins ?? 0}</td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{wb.draws ?? 0}</td>
                      <td className="px-3 py-3 font-mono text-xs text-red-400/70">{wb.losses ?? 0}</td>
                      <td className="px-3 py-3 font-mono text-xs font-bold text-gold">{vp}</td>
                      <td className="pr-4 pl-3 py-3 text-right font-mono text-xs text-muted-foreground">
                        {wb.warband_rating}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Campaign navigation */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Campaign</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/campaigns/${id}/standings`}
            className="rounded-md border border-border bg-card p-4 hover:border-gold/30 transition-colors"
          >
            <p className="text-sm font-semibold text-foreground">Full Standings →</p>
            <p className="text-xs text-muted-foreground mt-0.5">Rankings, VP, WR</p>
          </Link>
          <Link
            href={`/campaigns/${id}/territories`}
            className="rounded-md border border-border bg-card p-4 hover:border-gold/30 transition-colors"
          >
            <p className="text-sm font-semibold text-foreground">Territory Map →</p>
            <p className="text-xs text-muted-foreground mt-0.5">Claimed territories</p>
          </Link>
        </div>
      </section>

      {/* Pending approvals — commissioner only */}
      {isCommissioner && pendingPlayers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-amber-400/70">Pending Approvals</h2>
          <div className="space-y-2">
            {pendingPlayers.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border border-amber-400/20 bg-amber-400/5 px-4 py-3">
                <div>
                  <p className="text-sm text-foreground">{p.warbands?.name ?? 'Unknown warband'}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.profiles?.display_name ?? p.profiles?.username ?? 'Unknown player'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={`/api/campaigns/${id}/players/${p.id}/approve`} method="POST">
                    <button type="submit" className="px-3 py-1 text-xs rounded border border-emerald-500/40 text-emerald-400 hover:bg-emerald-400/10 transition-colors">
                      Approve
                    </button>
                  </form>
                  <form action={`/api/campaigns/${id}/players/${p.id}/reject`} method="POST">
                    <button type="submit" className="px-3 py-1 text-xs rounded border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Join CTA */}
      {user && !isCommissioner && !isParticipant && campaign.status === 'registration' && (
        <section className="rounded-md border border-gold/20 bg-gold/5 px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Join this Campaign</h2>
          <p className="text-xs text-muted-foreground">
            Select a warband from your roster and request to join.
          </p>
          <Link
            href={`/warbands?join=${id}`}
            className="inline-block px-4 py-2 text-sm rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          >
            Select Warband & Join
          </Link>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">{label}</p>
      <p className="text-sm font-mono text-foreground mt-0.5">{value}</p>
    </div>
  )
}
