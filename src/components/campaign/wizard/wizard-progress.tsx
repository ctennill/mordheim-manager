'use client'

const STEPS = [
  { n: 1, label: 'Basics' },
  { n: 2, label: 'Rules' },
  { n: 3, label: 'Factions' },
  { n: 4, label: 'Sessions' },
  { n: 5, label: 'Scoring' },
]

export function CampaignWizardProgress({ currentStep }: { currentStep: number }) {
  return (
    <nav>
      <ol className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done = step.n < currentStep
          const active = step.n === currentStep

          return (
            <li key={step.n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors ${
                  done   ? 'bg-gold border-gold text-background'
                  : active ? 'border-gold text-gold'
                  : 'border-border text-muted-foreground'
                }`}>
                  {done ? '✓' : step.n}
                </div>
                <span className={`hidden sm:block mt-1 text-[10px] uppercase tracking-wide ${
                  active ? 'text-gold' : done ? 'text-muted-foreground' : 'text-muted-foreground/50'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-px w-8 sm:w-12 mx-1 mb-4 sm:mb-5 transition-colors ${
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
