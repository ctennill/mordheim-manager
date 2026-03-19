'use client'

type Outcome = 'win' | 'loss' | 'draw'

interface StepOutcomeProps {
  myWarbandName: string
  opponentWarbandName: string
  result: Outcome | null
  myRoutedvalue: boolean
  opponentRouted: boolean
  onChange: (result: Outcome, myRouted: boolean, opponentRouted: boolean) => void
}

export function StepOutcome({ myWarbandName, opponentWarbandName, result, myRoutedvalue, opponentRouted, onChange }: StepOutcomeProps) {
  const OPTIONS: { value: Outcome; label: string; desc: string }[] = [
    { value: 'win',  label: 'My Warband Won',  desc: 'Opponent routed or scenario objective secured' },
    { value: 'draw', label: 'Draw',             desc: 'Mutual agreement, time ran out, or partial game' },
    { value: 'loss', label: 'My Warband Lost',  desc: 'My warband routed or opponent secured objective' },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Recording result for <span className="text-foreground font-medium">{myWarbandName}</span>{' '}
        vs <span className="text-foreground font-medium">{opponentWarbandName}</span>.
      </p>

      {/* Outcome buttons */}
      <div className="grid grid-cols-1 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value, myRoutedvalue, opponentRouted)}
            className={`text-left p-4 rounded border transition-colors ${
              result === o.value
                ? 'border-gold/60 bg-gold/10'
                : 'border-border hover:border-gold/20'
            }`}
          >
            <div className="font-medium text-sm text-foreground">{o.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{o.desc}</div>
          </button>
        ))}
      </div>

      {/* Rout checkboxes */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Rout Details</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={opponentRouted}
            onChange={(e) => onChange(result ?? 'win', myRoutedvalue, e.target.checked)}
            className="accent-gold"
          />
          <span className="text-sm text-foreground">{opponentWarbandName} routed</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={myRoutedvalue}
            onChange={(e) => onChange(result ?? 'loss', e.target.checked, opponentRouted)}
            className="accent-gold"
          />
          <span className="text-sm text-foreground">{myWarbandName} routed</span>
        </label>
      </div>
    </div>
  )
}
