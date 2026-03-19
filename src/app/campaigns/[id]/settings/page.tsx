import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { type Campaign } from '@/types/database'
import { SettingsForm } from '@/components/campaign/settings-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('campaigns').select('name').eq('id', id).single() as { data: { name: string } | null }
  return { title: data ? `${data.name} — Settings` : 'Campaign Settings — Mordheim Manager' }
}

export default async function CampaignSettingsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, description, location, points_win, points_draw, points_loss, status, max_warbands, total_sessions, current_session, commissioner_id')
    .eq('id', id)
    .single() as {
      data: Pick<Campaign, 'id' | 'name' | 'description' | 'location' | 'points_win' | 'points_draw' | 'points_loss' | 'status' | 'max_warbands' | 'total_sessions' | 'current_session' | 'commissioner_id'> | null
    }

  if (!campaign) notFound()
  if (campaign.commissioner_id !== user.id) {
    redirect(`/campaigns/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <Link
          href={`/campaigns/${id}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {campaign.name}
        </Link>
        <h1 className="font-cinzel text-2xl font-bold text-foreground">Campaign Settings</h1>
      </div>

      <SettingsForm campaign={campaign} />
    </div>
  )
}
