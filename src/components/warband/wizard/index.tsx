'use client'

import { useEffect } from 'react'
import { useWarbandBuilder, type WarbandBuilderStep } from '@/store/warband-builder'
import { WizardProgress } from './wizard-progress'
import { GoldTracker } from '@/components/warband/gold-tracker'
import { StepFaction } from './step-faction'
import { StepName } from './step-name'
import { StepHeroes } from './step-heroes'
import { StepHenchmen } from './step-henchmen'
import { StepEquip } from './step-equip'
import { StepReview } from './step-review'

const STEP_TITLES: Record<WarbandBuilderStep, string> = {
  faction:  'Choose Your Faction',
  name:     'Name Your Warband',
  heroes:   'Hire Your Heroes',
  henchmen: 'Hire Your Henchmen',
  equip:    'Equip Your Warriors',
  review:   'Review & Submit',
}

const STEP_ORDER: WarbandBuilderStep[] = ['faction', 'name', 'heroes', 'henchmen', 'equip', 'review']

interface WarbandWizardProps {
  initialFactionId?: string
}

export function WarbandWizard({ initialFactionId }: WarbandWizardProps) {
  const { step, setStep, factionId, setFaction, warbandName, heroes, reset } = useWarbandBuilder()

  // If a faction was pre-selected via URL param, skip step 1
  useEffect(() => {
    reset()
    if (initialFactionId) {
      // setFaction needs a name — we'll let the user see step 1 briefly while it loads,
      // then StepFaction auto-advances when faction is clicked.
      // For URL pre-select, we jump to name step after faction is set in StepFaction.
      // Actually: we just set the factionId in the URL — StepFaction handles pre-select.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentIdx = STEP_ORDER.indexOf(step)

  function canGoNext(): boolean {
    switch (step) {
      case 'faction':  return !!factionId
      case 'name':     return warbandName.trim().length >= 1
      case 'heroes':   return heroes.some((h) => h.position.is_leader)
      case 'henchmen': return true // optional — validation is in review
      case 'equip':    return true
      case 'review':   return false // submit is handled in StepReview
      default:         return false
    }
  }

  function goNext() {
    const next = STEP_ORDER[currentIdx + 1]
    if (next) setStep(next)
  }

  function goBack() {
    const prev = STEP_ORDER[currentIdx - 1]
    if (prev) setStep(prev)
  }

  const showGoldTracker = step !== 'faction' && step !== 'name'

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pb-8">

      {/* Sticky header: progress + gold tracker */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border py-4 mb-8 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <WizardProgress currentStep={step} />
          {showGoldTracker && <GoldTracker />}
        </div>
        <h2
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          {STEP_TITLES[step]}
        </h2>
      </div>

      {/* Step content */}
      <div className="flex-1">
        {step === 'faction'  && <StepFaction />}
        {step === 'name'     && <StepName />}
        {step === 'heroes'   && <StepHeroes />}
        {step === 'henchmen' && <StepHenchmen />}
        {step === 'equip'    && <StepEquip />}
        {step === 'review'   && <StepReview />}
      </div>

      {/* Navigation — hidden on review (StepReview has its own buttons) */}
      {step !== 'review' && (
        <div className="flex justify-between items-center pt-8 mt-8 border-t border-border">
          <button
            onClick={goBack}
            disabled={currentIdx === 0}
            className="px-4 py-2 text-sm border border-border rounded text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>

          <span className="text-xs text-muted-foreground/50">
            Step {currentIdx + 1} of {STEP_ORDER.length}
          </span>

          <button
            onClick={goNext}
            disabled={!canGoNext()}
            className="px-5 py-2 text-sm font-semibold rounded bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {step === 'equip' ? 'Review →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
