import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Admin — Mordheim Manager' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-border bg-card/40 px-6 py-2 flex items-center gap-6 text-sm">
        <span className="text-xs uppercase tracking-widest text-muted-foreground/40 font-mono">Admin</span>
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Overview</Link>
        <Link href="/admin/factions" className="text-muted-foreground hover:text-foreground transition-colors">Factions</Link>
        <Link href="/admin/equipment" className="text-muted-foreground hover:text-foreground transition-colors">Equipment</Link>
      </div>
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {children}
      </div>
    </div>
  )
}
