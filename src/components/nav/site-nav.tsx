import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { type Profile } from '@/types/database'
import { NavLink } from './nav-link'
import { UserMenu } from './user-menu'
import { MobileMenu } from './mobile-menu'

const NAV_LINKS = [
  { href: '/warbands', label: 'My Warbands' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/factions', label: 'Factions' },
]

export async function SiteNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'display_name' | 'username'> | null }
    displayName = profile?.display_name ?? profile?.username ?? user.email ?? 'Account'
  }

  return (
    <header className="relative border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">

        {/* Logo */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="font-cinzel text-base font-semibold text-gold hover:text-gold/80 transition-colors shrink-0"
        >
          Mordheim Manager
        </Link>

        {/* Desktop nav links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                activeClassName="text-foreground bg-white/5"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Spacer on logged-out */}
        {!user && <div className="flex-1" />}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {user && displayName ? (
            <>
              {/* Desktop user menu */}
              <div className="hidden md:block">
                <UserMenu displayName={displayName} />
              </div>
              {/* Mobile hamburger */}
              <MobileMenu displayName={displayName} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm border border-gold/40 text-gold hover:bg-gold/10 transition-colors px-3 py-1.5 rounded"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
