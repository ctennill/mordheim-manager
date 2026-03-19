import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WarbandWizard } from '@/components/warband/wizard'

export const metadata: Metadata = { title: 'New Warband' }

interface PageProps {
  searchParams: Promise<{ faction?: string }>
}

export default async function NewWarbandPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { faction } = await searchParams

  return (
    <main className="flex-1 flex flex-col pt-6">
      <WarbandWizard initialFactionId={faction} />
    </main>
  )
}
