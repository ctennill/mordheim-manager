import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type Profile } from '@/types/database'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  return (
    <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <h1
          className="text-3xl font-bold text-gold"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          Welcome back, {profile?.display_name ?? profile?.username ?? 'Warrior'}
        </h1>
        <p className="text-muted-foreground mt-1">Your campaign hub</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="My Warbands"
          description="Build and manage your warbands"
          href="/warbands"
          icon="⚔️"
        />
        <DashboardCard
          title="Campaigns"
          description="Join or create a campaign"
          href="/campaigns"
          icon="🗺️"
        />
        <DashboardCard
          title="Factions"
          description="Browse all available factions"
          href="/factions"
          icon="📜"
        />
      </div>
    </main>
  )
}

function DashboardCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <a
      href={href}
      className="block rounded-md border border-border bg-card p-5 space-y-2 hover:border-gold/40 transition-colors"
    >
      <div className="text-2xl">{icon}</div>
      <h3
        className="font-semibold text-sm tracking-wide text-gold-muted uppercase"
        style={{ fontFamily: 'var(--font-cinzel), serif' }}
      >
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </a>
  )
}
