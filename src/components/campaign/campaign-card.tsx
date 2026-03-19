import Link from 'next/link'
import { type Campaign } from '@/types/database'

const MODE_LABELS: Record<string, string> = {
  standard: 'Standard',
  open: 'Open',
  event: 'Event',
  solo: 'Solo',
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'text-zinc-400 border-zinc-600/40',
  registration: 'text-amber-400 border-amber-400/40',
  active: 'text-emerald-400 border-emerald-400/40',
  completed: 'text-blue-400 border-blue-400/40',
  archived: 'text-zinc-500 border-zinc-600/30',
}

type CampaignCardProps = {
  campaign: Pick<Campaign, 'id' | 'name' | 'mode' | 'status' | 'privacy' | 'location' | 'description' | 'total_sessions' | 'current_session' | 'max_warbands'>
  playerCount?: number
}

export function CampaignCard({ campaign: c, playerCount = 0 }: CampaignCardProps) {
  const statusStyle = STATUS_STYLES[c.status] ?? 'text-muted-foreground border-border'
  const progressPct = c.total_sessions
    ? Math.min(100, Math.round((c.current_session / c.total_sessions) * 100))
    : null

  return (
    <Link
      href={`/campaigns/${c.id}`}
      className="block rounded-md border border-border bg-card hover:border-gold/30 transition-colors p-5 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
          {c.location && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.location}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded border capitalize ${statusStyle}`}>
          {c.status}
        </span>
      </div>

      {/* Description */}
      {c.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
      )}

      {/* Session progress bar */}
      {progressPct !== null && c.status === 'active' && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Session {c.current_session} / {c.total_sessions}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
            <div className="h-full bg-gold/60 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/60">
        <span>{MODE_LABELS[c.mode] ?? c.mode}</span>
        <span className="text-border">·</span>
        <span>{playerCount} / {c.max_warbands} players</span>
        {c.privacy !== 'public' && (
          <>
            <span className="text-border">·</span>
            <span className="capitalize">{c.privacy}</span>
          </>
        )}
      </div>
    </Link>
  )
}
