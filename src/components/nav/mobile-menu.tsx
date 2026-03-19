'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/warbands', label: 'My Warbands' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/factions', label: 'Factions' },
]

interface MobileMenuProps {
  displayName: string | null
}

export function MobileMenu({ displayName }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg md:hidden z-50">
          <nav className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded text-sm transition-colors ${
                    isActive
                      ? 'text-gold bg-gold/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          {displayName && (
            <div className="px-4 py-3 border-t border-border space-y-1">
              <p className="px-3 py-1 text-xs text-muted-foreground/60 truncate">{displayName}</p>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
