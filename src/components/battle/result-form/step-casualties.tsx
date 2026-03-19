'use client'

export interface CasualtyWarrior {
  id: string
  name: string
  isHero: boolean
  groupCount: number
  outOfActionCount: number // 0–groupCount
}

interface StepCasualtiesProps {
  warriors: CasualtyWarrior[]
  onChange: (warriors: CasualtyWarrior[]) => void
}

export function StepCasualties({ warriors, onChange }: StepCasualtiesProps) {
  function setOoA(id: string, count: number) {
    onChange(warriors.map((w) => w.id === id ? { ...w, outOfActionCount: count } : w))
  }

  const heroes = warriors.filter((w) => w.isHero)
  const henchmen = warriors.filter((w) => !w.isHero)

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Mark warriors that went Out of Action during this battle.
        OOA warriors will roll on the Serious Injury table in the post-battle sequence.
      </p>

      {heroes.length > 0 && (
        <WarriorSection title="Heroes" warriors={heroes} onSetOoA={setOoA} />
      )}
      {henchmen.length > 0 && (
        <WarriorSection title="Henchmen" warriors={henchmen} onSetOoA={setOoA} />
      )}

      {warriors.length === 0 && (
        <p className="text-sm text-muted-foreground/60 text-center py-4">
          No warriors found for this warband.
        </p>
      )}
    </div>
  )
}

function WarriorSection({
  title, warriors, onSetOoA,
}: {
  title: string
  warriors: CasualtyWarrior[]
  onSetOoA: (id: string, count: number) => void
}) {
  return (
    <section className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/60">{title}</p>
      <div className="space-y-1.5">
        {warriors.map((w) => (
          <div
            key={w.id}
            className={`flex items-center justify-between gap-4 rounded border px-4 py-3 transition-colors ${
              w.outOfActionCount > 0
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="min-w-0">
              <span className="text-sm text-foreground">
                {w.name || (w.isHero ? 'Hero' : 'Henchmen')}
              </span>
              {!w.isHero && w.groupCount > 1 && (
                <span className="text-xs text-muted-foreground ml-1.5">×{w.groupCount}</span>
              )}
            </div>

            {w.groupCount === 1 ? (
              // Hero or single henchman — simple toggle
              <button
                type="button"
                onClick={() => onSetOoA(w.id, w.outOfActionCount > 0 ? 0 : 1)}
                className={`shrink-0 px-3 py-1 text-xs rounded border transition-colors ${
                  w.outOfActionCount > 0
                    ? 'border-destructive/60 bg-destructive/10 text-destructive'
                    : 'border-border text-muted-foreground hover:border-gold/40'
                }`}
              >
                {w.outOfActionCount > 0 ? 'Out of Action' : 'Active'}
              </button>
            ) : (
              // Henchman group — number selector
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">OOA:</span>
                <button
                  type="button"
                  onClick={() => onSetOoA(w.id, Math.max(0, w.outOfActionCount - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-gold/40 text-muted-foreground transition-colors"
                >−</button>
                <span className="w-5 text-center font-mono text-sm text-foreground">{w.outOfActionCount}</span>
                <button
                  type="button"
                  onClick={() => onSetOoA(w.id, Math.min(w.groupCount, w.outOfActionCount + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-gold/40 text-muted-foreground transition-colors"
                >+</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
