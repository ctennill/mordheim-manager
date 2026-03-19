'use client'

import { useCampaignCreation } from '@/store/campaign-creation'

export function StepScoring() {
  const state = useCampaignCreation()

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Configure how league points are awarded after each battle. These points determine final
        standings at the end of the campaign.
      </p>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Result
              </th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                League Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <ScoreRow
              label="Win"
              description="Opponent routed or objective secured"
              value={state.pointsWin}
              onChange={(v) => state.set({ pointsWin: v })}
              min={0}
              max={5}
            />
            <ScoreRow
              label="Draw"
              description="Both sides achieve partial objectives"
              value={state.pointsDraw}
              onChange={(v) => state.set({ pointsDraw: v })}
              min={0}
              max={3}
            />
            <ScoreRow
              label="Loss"
              description="Warband routed or objective missed"
              value={state.pointsLoss}
              onChange={(v) => state.set({ pointsLoss: v })}
              min={0}
              max={2}
            />
          </tbody>
        </table>
      </div>

      {/* Preview */}
      <div className="rounded-md border border-gold/20 bg-gold/5 px-4 py-3 space-y-1">
        <p className="text-xs uppercase tracking-widest text-gold/70 font-medium">Preview</p>
        <p className="text-sm text-muted-foreground">
          After 8 sessions with all wins:{' '}
          <span className="text-gold font-mono">{8 * state.pointsWin} pts</span>
          {' '}— all losses:{' '}
          <span className="text-muted-foreground font-mono">{8 * state.pointsLoss} pts</span>
        </p>
      </div>
    </div>
  )
}

function ScoreRow({
  label, description, value, onChange, min, max,
}: {
  label: string
  description: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-gold/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            −
          </button>
          <span className="w-6 text-center font-mono text-gold">{value}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-gold/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            +
          </button>
        </div>
      </td>
    </tr>
  )
}
