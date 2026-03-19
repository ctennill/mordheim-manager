import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-4">
      {/* Hero */}
      <div className="text-center max-w-2xl space-y-6">
        <h1
          className="text-5xl md:text-6xl font-bold tracking-wide text-gold"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          Mordheim Manager
        </h1>
        <p className="text-lg text-muted-foreground">
          Build warbands. Fight campaigns. Track every warrior&apos;s rise — and fall.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Begin Your Campaign
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-3xl w-full">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-md border border-border bg-card p-5 space-y-2">
            <div className="text-2xl">{f.icon}</div>
            <h3
              className="font-semibold text-sm tracking-wide text-gold-muted uppercase"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              {f.title}
            </h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-16 text-xs text-muted-foreground/50">
        Unofficial fan tool. Mordheim is a product of Games Workshop.
      </p>
    </main>
  )
}

const FEATURES = [
  {
    icon: '⚔️',
    title: 'Warband Builder',
    description:
      'Build a legal roster from all 10 official factions with live gold tracking and validation.',
  },
  {
    icon: '🗺️',
    title: 'Campaign Manager',
    description:
      'Run Standard, Open, or Event campaigns with automated pairings and session management.',
  },
  {
    icon: '💀',
    title: 'Post-Battle Sequence',
    description:
      'Guided injury rolls, XP tracking, advancement tables, and treasury management.',
  },
]
