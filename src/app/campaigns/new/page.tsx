import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { CampaignWizard } from '@/components/campaign/wizard'

export const metadata = { title: 'Create Campaign — Mordheim Manager' }

export default async function NewCampaignPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-cinzel text-2xl font-bold text-foreground">Create a Campaign</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set up your Mordheim campaign — configure rules, factions, and scoring.
        </p>
      </div>
      <CampaignWizard />
    </div>
  )
}
