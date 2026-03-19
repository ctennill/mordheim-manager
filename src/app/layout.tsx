import type { Metadata } from 'next'
import { Geist, Geist_Mono, Cinzel } from 'next/font/google'
import { Providers } from '@/components/providers'
import { SiteNav } from '@/components/nav/site-nav'
import { NavGuard } from '@/components/nav/nav-guard'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Gothic serif font for headings and titles
const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Mordheim Manager',
    template: '%s | Mordheim Manager',
  },
  description:
    'Manage your Mordheim warbands, track campaigns, and automate the post-battle sequence.',
  keywords: ['Mordheim', 'warband', 'campaign', 'tabletop', 'wargame'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NavGuard><SiteNav /></NavGuard>
        <Providers>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
