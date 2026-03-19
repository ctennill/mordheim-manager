import Link from 'next/link'
import { createClient } from "@/lib/supabase/server"
import { CampaignCard } from '@/components/campaign/campaign-card'
import { type Campaign } from '@/types/database'

export const metadata = { title: 'Campaigns — Mordheim Manager' }

type CampaignRow = Pick<Campaign, 'id' | 'name' | 'mode' | 'status' | 'privacy' | 'location' | 'description' | 'total_sessions' | 'current_session' | 'max_warbands'>

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Public campaigns + user's own campaigns
  let campaigns: (CampaignRow & { player_count: number })[] = []

  if (user) {
    // Fetch campaigns the user is part of OR that are public
    const { data } = await supabase
      .from('campaigns')
      .select(`
        id, name, mode, status, privacy, location, description,
        total_sessions, current_session, max_warbands,
        campaign_players(count)
      `)
      .or(`privacy.eq.public,commissioner_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50)

    campaigns = (data ?? []).map((c: CampaignRow & { campaign_players?: { count: number }[] }) => ({
      ...c,
      player_count: c.campaign_players?.[0]?.count ?? 0,
    }))
  } else {
    const { data } = await supabase
      .from('campaigns')
      .select(`
        id, name, mode, status, privacy, location, description,
        total_sessions, current_session, max_warbands,
        campaign_players(count)
      `)
      .eq('privacy', 'public')
      .order('created_at', { ascending: false })
      .limit(50)

    campaigns = (data ?? []).map((c: CampaignRow & { campaign_players?: { count: number }[] }) => ({
      ...c,
      player_count: c.campaign_players?.[0]?.count ?? 0,
    }))
  }

  const active = campaigns.filter((c) => c.status === 'active')
  const other = campaigns.filter((c) => c.status !== 'active')

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and join Mordheim campaigns</p>
        </div>
        {user && (
          <Link
            href="/campaigns/new"
            className="px-4 py-2 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          >
            New Campaign
          </Link>
        )}
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No campaigns found.</p>
          {user && (
            <Link href="/campaigns/new" className="inline-block mt-4 text-sm text-gold hover:underline">
              Create the first one
            </Link>
          )}
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Active</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {active.map((c) => (
                  <CampaignCard key={c.id} campaign={c} playerCount={c.player_count} />
                ))}
              </div>
            </section>
          )}
          {other.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">
                {active.length > 0 ? 'Other' : 'All Campaigns'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {other.map((c) => (
                  <CampaignCard key={c.id} campaign={c} playerCount={c.player_count} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
