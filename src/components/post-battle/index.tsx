'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { usePostBattle, type PostBattleStep } from '@/store/post-battle'
import { PostBattleProgress } from './wizard-progress'
import { StepInjuries } from './step-injuries'
import { StepIncome } from './step-income'
import { StepExploration } from './step-exploration'
import { StepExperience } from './step-experience'
import { StepAdvancements } from './step-advancements'
import { StepSpend } from './step-spend'
import { StepSubmit } from './step-submit'

const STEP_TITLES: Record<PostBattleStep, string> = {
  1: 'Serious Injuries',
  2: 'Captives',
  3: 'Income',
  4: 'Exploration',
  5: 'Experience',
  6: 'Advancements',
  7: 'Spend Income',
  8: 'Review & Submit',
}

function StepCaptives() {
  const { oaaWarriors } = usePostBattle()
  const capturedWarriors = oaaWarriors.filter((w) => w.result?.effect === 'captured')
  if (capturedWarriors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No warriors were captured this battle.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        The following warriors were captured. Captive resolution is handled between warbands
        and the commissioner outside this wizard.
      </p>
      {capturedWarriors.map((w) => (
        <div key={w.warriorId} className="rounded border border-purple-500/30 bg-purple-500/5 px-4 py-3">
          <p className="text-sm font-medium text-foreground">{w.warriorName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Held prisoner — contact the opposing commissioner to arrange ransom, free, or execute.
          </p>
        </div>
      ))}
    </div>
  )
}

export function PostBattleWizard() {
  const state = usePostBattle()
  const router = useRouter()

  function canGoNext(): boolean {
    switch (state.step) {
      case 1: return state.oaaWarriors.length === 0 || state.oaaWarriors.every((w) => w.applied)
      case 4: return state.exploringHeroes.length === 0 || state.explorationOutcomes.length > 0
      case 6: return state.advancementQueue.length === 0 || state.advancementQueue.every((a) => a.applied)
      default: return true
    }
  }

  async function handleSubmit() {
    if (!state.battleId || !state.warbandId) {
      toast.error('Invalid post-battle state — please restart.')
      return
    }

    const toastId = toast.loading('Submitting post-battle sequence…')
    try {
      const res = await fetch(`/api/battles/${state.battleId}/post-battle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warbandId: state.warbandId,
          side: state.side,
          injuries: state.oaaWarriors.map((w) => ({
            warriorId: w.warriorId,
            d66Roll: w.d66Roll,
            injuryName: w.result?.name,
            effectType: w.result?.effect,
            effectDescription: w.result?.description,
            statMod: w.result?.statMod ?? null,
            goldLoss: w.resolvedGoldLoss,
            subRolls: w.subRolls.map((sr) => ({
              d66: sr.d66,
              name: sr.result.name,
              effect: sr.result.effect,
              statMod: sr.result.statMod ?? null,
            })),
          })),
          xpGains: state.xpEntries.map((e) => ({
            warriorId: e.warriorId,
            xpGained: e.xpGained,
          })),
          advancements: state.advancementQueue.map((a) => ({
            warriorId: a.warriorId,
            advanceIndex: a.advanceIndex,
            roll2d6: a.roll2d6,
            chosenStat: a.chosenStat,
            chosenSkill: a.chosenSkill,
          })),
          incomeTotal: state.totalIncome,
          explorationGold: state.explorationOutcomes.reduce((s, o) => s + o.goldResolved, 0),
          goldSpent: state.goldSpent,
          spendNotes: state.spendNotes,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Submission failed')
      }

      toast.success('Post-battle sequence complete!', { id: toastId })
      state.reset()
      router.push(`/warbands/${state.warbandId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit', { id: toastId })
    }
  }

  const isLastStep = state.step === 8

  return (
    <div className="space-y-8">
      <PostBattleProgress currentStep={state.step} />

      <div>
        <h2 className="text-xl font-semibold text-foreground">{STEP_TITLES[state.step]}</h2>
        <p className="text-xs text-muted-foreground/60 mt-0.5">Step {state.step} of 8</p>
      </div>

      <div>
        {state.step === 1 && <StepInjuries />}
        {state.step === 2 && <StepCaptives />}
        {state.step === 3 && <StepIncome />}
        {state.step === 4 && <StepExploration />}
        {state.step === 5 && <StepExperience />}
        {state.step === 6 && <StepAdvancements />}
        {state.step === 7 && <StepSpend />}
        {state.step === 8 && <StepSubmit />}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => state.setStep((state.step - 1) as PostBattleStep)}
          disabled={state.step === 1}
          className="px-4 py-2 text-sm border border-border rounded hover:border-gold/40 text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          >
            Submit Post-Battle
          </button>
        ) : (
          <button
            type="button"
            onClick={() => state.setStep((state.step + 1) as PostBattleStep)}
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
