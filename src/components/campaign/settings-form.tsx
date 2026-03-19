'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { type Campaign } from '@/types/database'

interface SettingsFormProps {
  campaign: Pick<
    Campaign,
    | 'id'
    | 'name'
    | 'description'
    | 'location'
    | 'points_win'
    | 'points_draw'
    | 'points_loss'
    | 'status'
    | 'max_warbands'
    | 'total_sessions'
    | 'current_session'
  >
}

const STATUS_OPTIONS: Campaign['status'][] = ['draft', 'registration', 'active', 'completed', 'archived']

export function SettingsForm({ campaign }: SettingsFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [advancing, setAdvancing] = useState(false)

  const [name, setName] = useState(campaign.name)
  const [description, setDescription] = useState(campaign.description ?? '')
  const [location, setLocation] = useState(campaign.location ?? '')
  const [pointsWin, setPointsWin] = useState(campaign.points_win)
  const [pointsDraw, setPointsDraw] = useState(campaign.points_draw)
  const [pointsLoss, setPointsLoss] = useState(campaign.points_loss)
  const [status, setStatus] = useState<Campaign['status']>(campaign.status)
  const [maxWarbands, setMaxWarbands] = useState(campaign.max_warbands)
  const [totalSessions, setTotalSessions] = useState<string>(
    campaign.total_sessions != null ? String(campaign.total_sessions) : ''
  )

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          location: location || null,
          points_win: pointsWin,
          points_draw: pointsDraw,
          points_loss: pointsLoss,
          status,
          max_warbands: maxWarbands,
          total_sessions: totalSessions ? parseInt(totalSessions, 10) : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        toast.error(data.error ?? 'Failed to save settings')
        return
      }
      toast.success('Settings saved')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleAdvanceSession() {
    setAdvancing(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/session`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        toast.error(data.error ?? 'Failed to advance session')
        return
      }
      const { current_session } = await res.json() as { current_session: number }
      toast.success(`Advanced to Session ${current_session}`)
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Basic Info</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:border-gold/60 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:border-gold/60 outline-none resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:border-gold/60 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Status & capacity */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Status & Capacity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Campaign['status'])}
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:border-gold/60 outline-none capitalize"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Max Warbands</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMaxWarbands((v) => Math.max(1, v - 1))}
                className="w-8 h-9 rounded border border-border text-muted-foreground hover:text-foreground hover:border-gold/40 transition-colors text-sm"
              >−</button>
              <input
                type="number"
                value={maxWarbands}
                onChange={(e) => setMaxWarbands(parseInt(e.target.value, 10) || 1)}
                min={1}
                className="flex-1 px-2 py-2 rounded border border-border bg-background text-foreground text-sm text-center focus:border-gold/60 outline-none"
              />
              <button
                type="button"
                onClick={() => setMaxWarbands((v) => v + 1)}
                className="w-8 h-9 rounded border border-border text-muted-foreground hover:text-foreground hover:border-gold/40 transition-colors text-sm"
              >+</button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Total Sessions</label>
            <input
              type="number"
              value={totalSessions}
              onChange={(e) => setTotalSessions(e.target.value)}
              placeholder="Open-ended"
              min={1}
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:border-gold/60 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60">Scoring</h2>
        <div className="grid grid-cols-3 gap-4">
          {([
            { label: 'Win', value: pointsWin, set: setPointsWin },
            { label: 'Draw', value: pointsDraw, set: setPointsDraw },
            { label: 'Loss', value: pointsLoss, set: setPointsLoss },
          ] as const).map(({ label, value, set }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Points — {label}</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => set((v) => Math.max(0, v - 1))}
                  className="w-8 h-9 rounded border border-border text-muted-foreground hover:text-foreground hover:border-gold/40 transition-colors text-sm"
                >−</button>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => set(parseInt(e.target.value, 10) || 0)}
                  min={0}
                  className="flex-1 px-2 py-2 rounded border border-border bg-background text-foreground text-sm text-center focus:border-gold/60 outline-none"
                />
                <button
                  type="button"
                  onClick={() => set((v) => v + 1)}
                  className="w-8 h-9 rounded border border-border text-muted-foreground hover:text-foreground hover:border-gold/40 transition-colors text-sm"
                >+</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-border">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded border border-gold/60 bg-gold/10 text-gold text-sm hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>

        {/* Session advance */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Current session: <span className="font-mono text-foreground">{campaign.current_session}</span>
          </span>
          <button
            type="button"
            onClick={handleAdvanceSession}
            disabled={advancing}
            className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors disabled:opacity-50"
          >
            {advancing ? 'Advancing…' : `Advance to Session ${campaign.current_session + 1}`}
          </button>
        </div>
      </div>
    </form>
  )
}
