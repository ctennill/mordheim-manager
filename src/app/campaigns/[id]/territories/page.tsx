import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CampaignTerritoryMap } from '@/components/territory/campaign-territory-map'
import { type Territory, type WarbandTerritory, type Campaign, type Warband } from '@/types/database'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('campaigns').select('name').eq('id', id).single() as { data: { name: string } | null }
  return { title: data ? `${data.name} — Territories` : 'Territories' }
}

type HoldingRow = WarbandTerritory & {
  territories: Territory
  warbands: Pick<Warband, 'id' | 'name'> & { factions: { name: string } | null }
}

export default async function CampaignTerritoriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, commissioner_id')
    .eq('id', campaignId)
    .single() as { data: Pick<Campaign, 'id' | 'name' | 'commissioner_id'> | null }

  if (!campaign) notFound()

  const isCommissioner = campaign.commissioner_id === user?.id

  const [holdingsRes, territoriesRes] = await Promise.all([
    supabase
      .from('warband_territories')
      .select(`
        *,
        territories(*),
        warbands:warband_id(id, name, factions:faction_id(name))
      `)
      .eq('campaign_id', campaignId)
      .order('acquired_at') as unknown as Promise<{ data: HoldingRow[] | null }>,
    supabase
      .from('territories')
      .select('*')
      .order('name') as unknown as Promise<{ data: Territory[] | null }>,
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link href={`/campaigns/${campaignId}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← {campaign.name}
          </Link>
          <h1 className="font-cinzel text-2xl font-bold text-foreground mt-1">Territory Map</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {holdingsRes.data?.length ?? 0} territories claimed across this campaign
          </p>
        </div>
      </div>

      <CampaignTerritoryMap
        holdings={holdingsRes.data ?? []}
        allTerritories={territoriesRes.data ?? []}
        isCommissioner={isCommissioner}
        campaignId={campaignId}
      />
    </div>
  )
}
