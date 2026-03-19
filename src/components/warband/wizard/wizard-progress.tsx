'use client'

import { type WarbandBuilderStep } from '@/store/warband-builder'

const STEPS: { key: WarbandBuilderStep; label: string; short: string }[] = [
  { key: 'faction',  label: 'Faction',  short: '1' },
  { key: 'name',     label: 'Name',     short: '2' },
  { key: 'heroes',   label: 'Heroes',   short: '3' },
  { key: 'henchmen', label: 'Henchmen', short: '4' },
  { key: 'equip',    label: 'Equip',    short: '5' },
  { key: 'review',   label: 'Review',   short: '6' },
]

const STEP_INDEX: Record<WarbandBuilderStep, number> = {
  faction: 0, name: 1, heroes: 2, henchmen: 3, equip: 4, review: 5,
}

interface WizardProgressProps {
  currentStep: WarbandBuilderStep
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const currentIdx = STEP_INDEX[currentStep]

  return (
    <nav aria-label="Wizard progress">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx

          return (
            <li key={step.key} className="flex items-center">
              {/* Step dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors ${
                    done
                      ? 'bg-gold border-gold text-background'
                      : active
                      ? 'border-gold text-gold bg-transparent'
                      : 'border-border text-muted-foreground bg-transparent'
                  }`}
                >
                  {done ? '✓' : step.short}
                </div>
                <span
                  className={`hidden sm:block mt-1 text-[10px] uppercase tracking-wide ${
                    active ? 'text-gold' : done ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 sm:w-12 mx-1 mb-4 sm:mb-5 transition-colors ${
                    idx < currentIdx ? 'bg-gold/60' : 'bg-border'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
