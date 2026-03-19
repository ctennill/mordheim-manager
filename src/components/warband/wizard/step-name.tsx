'use client'

import { useWarbandBuilder } from '@/store/warband-builder'
import { getFactionTheme } from '@/lib/faction-theme'

export function StepName() {
  const { factionName, warbandName, motto, background, setWarbandName, setMotto, setBackground } =
    useWarbandBuilder()

  const theme = factionName ? getFactionTheme(factionName) : null

  return (
    <div className="max-w-lg space-y-6">
      <p className="text-sm text-muted-foreground">
        Give your warband a name and optional background. The name must be unique within your
        campaign.
      </p>

      <div className="space-y-4">
        {/* Warband name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="warband-name">
            Warband Name <span className="text-destructive">*</span>
          </label>
          <input
            id="warband-name"
            type="text"
            value={warbandName}
            onChange={(e) => setWarbandName(e.target.value)}
            placeholder={factionName ? `The ${factionName} of...` : 'My Warband'}
            maxLength={60}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">{warbandName.length} / 60 characters</p>
        </div>

        {/* Motto */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="motto">
            Motto <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="motto"
            type="text"
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            placeholder='"Death before dishonour"'
            maxLength={100}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Background */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="background">
            Background / Notes <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="background"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="The story of how your warband came to Mordheim…"
            rows={4}
            maxLength={1000}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
      </div>

      {factionName && theme && (
        <div className={`rounded border p-3 text-sm ${theme.borderClass}`}>
          <span className="text-muted-foreground">Faction: </span>
          <span className={`font-semibold ${theme.accentClass}`}>
            {theme.icon} {factionName}
          </span>
        </div>
      )}
    </div>
  )
}
