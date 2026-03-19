'use client'

const STEPS = [
  { n: 1, label: 'Injuries' },
  { n: 2, label: 'Captives' },
  { n: 3, label: 'Income' },
  { n: 4, label: 'Explore' },
  { n: 5, label: 'XP' },
  { n: 6, label: 'Advance' },
  { n: 7, label: 'Spend' },
  { n: 8, label: 'Submit' },
]

export function PostBattleProgress({ currentStep }: { currentStep: number }) {
  return (
    <nav>
      <ol className="flex items-center gap-0 overflow-x-auto pb-1">
        {STEPS.map((step, idx) => {
          const done = step.n < currentStep
          const active = step.n === currentStep
          return (
            <li key={step.n} className="flex items-center shrink-0">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors ${
                  done   ? 'bg-gold border-gold text-background'
                  : active ? 'border-gold text-gold'
                  : 'border-border text-muted-foreground'
                }`}>
                  {done ? '✓' : step.n}
                </div>
                <span className={`hidden sm:block mt-1 text-[10px] uppercase tracking-wide whitespace-nowrap ${
                  active ? 'text-gold' : done ? 'text-muted-foreground' : 'text-muted-foreground/50'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-px w-4 sm:w-8 mx-0.5 mb-4 sm:mb-5 shrink-0 transition-colors ${
                  step.n < currentStep ? 'bg-gold/60' : 'bg-border'
                }`} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
