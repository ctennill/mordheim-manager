'use client'

import { useRouter } from 'next/navigation'
import { useCampaignCreation } from '@/store/campaign-creation'
import { CampaignWizardProgress } from './wizard-progress'
import { StepBasics } from './step-basics'
import { StepRules } from './step-rules'
import { StepFactions } from './step-factions'
import { StepSessions } from './step-sessions'
import { StepScoring } from './step-scoring'
import { toast } from 'sonner'

const STEP_TITLES = [
  'Campaign Basics',
  'Rules Configuration',
  'Faction Availability',
  'Session Structure',
  'Scoring',
]

export function CampaignWizard() {
  const state = useCampaignCreation()
  const router = useRouter()

  function canGoNext(): boolean {
    switch (state.step) {
      case 1: return state.name.trim().length > 0
      case 2: return true
      case 3: return true
      case 4: return true
      case 5: return true
      default: return false
    }
  }

  async function handleFinish() {
    const toastId = toast.loading('Creating campaign…')
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name,
          mode: state.mode,
          location: state.location,
          privacy: state.privacy,
          description: state.description,
          ruleset: state.ruleset,
          startingGold: state.startingGold,
          startingXpBonus: state.startingXpBonus,
          maxWarbandSize: state.maxWarbandSize,
          maxWarbands: state.maxWarbands,
          hiredSwordsEnabled: state.hiredSwordsEnabled,
          dramatisPersonaeEnabled: state.dramatisPersonaeEnabled,
          magicItemsSetting: state.magicItemsSetting,
          alignmentRulesEnabled: state.alignmentRulesEnabled,
          allowAllOfficial: state.allowAllOfficial,
          allowSupplements: state.allowSupplements,
          allowedFactionIds: state.allowedFactionIds,
          factionSlots: state.factionSlots,
          totalSessions: state.totalSessions,
          pairingMethod: state.pairingMethod,
          pointsWin: state.pointsWin,
          pointsDraw: state.pointsDraw,
          pointsLoss: state.pointsLoss,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Unknown error')
      }

      const { id } = await res.json()
      toast.success('Campaign created!', { id: toastId })
      state.reset()
      router.push(`/campaigns/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create campaign', { id: toastId })
    }
  }

  const isLastStep = state.step === 5

  return (
    <div className="space-y-8">
      {/* Progress */}
      <CampaignWizardProgress currentStep={state.step} />

      {/* Step heading */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">{STEP_TITLES[state.step - 1]}</h2>
        <p className="text-xs text-muted-foreground/60 mt-0.5">Step {state.step} of 5</p>
      </div>

      {/* Step content */}
      <div>
        {state.step === 1 && <StepBasics />}
        {state.step === 2 && <StepRules />}
        {state.step === 3 && <StepFactions />}
        {state.step === 4 && <StepSessions />}
        {state.step === 5 && <StepScoring />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => state.setStep(state.step - 1)}
          disabled={state.step === 1}
          className="px-4 py-2 text-sm border border-border rounded hover:border-gold/40 hover:text-foreground text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-2 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          >
            Create Campaign
          </button>
        ) : (
          <button
            type="button"
            onClick={() => state.setStep(state.step + 1)}
            disabled={!canGoNext()}
            className="px-6 py-2 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
