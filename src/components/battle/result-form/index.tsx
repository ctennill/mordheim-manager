'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StepOutcome } from './step-outcome'
import { StepCasualties, type CasualtyWarrior } from './step-casualties'
import { StepWyrdstone } from './step-wyrdstone'

type Outcome = 'win' | 'loss' | 'draw'

const STEPS = [
  { n: 1, label: 'Outcome' },
  { n: 2, label: 'Casualties' },
  { n: 3, label: 'Wyrdstone' },
  { n: 4, label: 'Review' },
]

interface BattleResultFormProps {
  battleId: string
  myWarbandId: string
  myWarbandName: string
  opponentWarbandName: string
  side: 'a' | 'b'
  warriors: CasualtyWarrior[]
}

export function BattleResultForm({
  battleId, myWarbandId, myWarbandName, opponentWarbandName, side, warriors,
}: BattleResultFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [result, setResult] = useState<Outcome | null>(null)
  const [myRouted, setMyRouted] = useState(false)
  const [opponentRouted, setOpponentRouted] = useState(false)
  const [casualties, setCasualties] = useState<CasualtyWarrior[]>(warriors)
  const [wyrdstone, setWyrdstone] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  function canAdvance(): boolean {
    if (step === 1) return result !== null
    return true
  }

  async function handleSubmit() {
    if (!result) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/battles/${battleId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side,
          result,
          myRouted,
          opponentRouted,
          wyrdstoneShards: wyrdstone,
          warriors: casualties.map((w) => ({
            id: w.id,
            outOfActionCount: w.outOfActionCount,
          })),
        }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to submit result')
      }
      toast.success('Result submitted — awaiting opponent confirmation')
      router.push(`/battles/${battleId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const oaaCount = casualties.reduce((s, w) => s + w.outOfActionCount, 0)

  return (
    <div className="space-y-8">
      {/* Progress */}
      <nav>
        <ol className="flex items-center gap-0">
          {STEPS.map((s, idx) => {
            const done = s.n < step
            const active = s.n === step
            return (
              <li key={s.n} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border-2 transition-colors ${
                    done ? 'bg-gold border-gold text-background'
                    : active ? 'border-gold text-gold'
                    : 'border-border text-muted-foreground'
                  }`}>
                    {done ? '✓' : s.n}
                  </div>
                  <span className={`hidden sm:block mt-1 text-[10px] uppercase tracking-wide ${
                    active ? 'text-gold' : done ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  }`}>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-px w-8 sm:w-12 mx-1 mb-4 sm:mb-5 ${s.n < step ? 'bg-gold/60' : 'bg-border'}`} />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div>
        {step === 1 && (
          <StepOutcome
            myWarbandName={myWarbandName}
            opponentWarbandName={opponentWarbandName}
            result={result}
            myRoutedvalue={myRouted}
            opponentRouted={opponentRouted}
            onChange={(r, mr, or_) => { setResult(r); setMyRouted(mr); setOpponentRouted(or_) }}
          />
        )}
        {step === 2 && (
          <StepCasualties warriors={casualties} onChange={setCasualties} />
        )}
        {step === 3 && (
          <StepWyrdstone shards={wyrdstone} onChange={setWyrdstone} />
        )}
        {step === 4 && (
          <ReviewStep
            myWarbandName={myWarbandName}
            opponentWarbandName={opponentWarbandName}
            result={result!}
            myRouted={myRouted}
            opponentRouted={opponentRouted}
            oaaCount={oaaCount}
            wyrdstone={wyrdstone}
          />
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1) as typeof step)}
          disabled={step === 1}
          className="px-4 py-2 text-sm border border-border rounded hover:border-gold/40 text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s + 1) as typeof step)}
            disabled={!canAdvance()}
            className="px-6 py-2 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 text-sm font-medium rounded border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Result'}
          </button>
        )}
      </div>
    </div>
  )
}

function ReviewStep({
  myWarbandName, opponentWarbandName, result, myRouted, opponentRouted, oaaCount, wyrdstone,
}: {
  myWarbandName: string
  opponentWarbandName: string
  result: Outcome
  myRouted: boolean
  opponentRouted: boolean
  oaaCount: number
  wyrdstone: number
}) {
  const RESULT_LABEL: Record<Outcome, string> = { win: 'Win', draw: 'Draw', loss: 'Loss' }
  const RESULT_COLOR: Record<Outcome, string> = {
    win: 'text-emerald-400', draw: 'text-amber-400', loss: 'text-red-400',
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Review your result before submitting.</p>
      <div className="rounded-md border border-border bg-card divide-y divide-border">
        <Row label="Result" value={<span className={`font-medium ${RESULT_COLOR[result]}`}>{RESULT_LABEL[result]}</span>} />
        <Row label="My Warband" value={myWarbandName} />
        <Row label="Opponent" value={opponentWarbandName} />
        <Row label="Wyrdstone Collected" value={`${wyrdstone} shard${wyrdstone !== 1 ? 's' : ''}`} />
        <Row label="Warriors OOA" value={String(oaaCount)} />
        {myRouted && <Row label="" value={<span className="text-amber-400 text-xs">My warband routed</span>} />}
        {opponentRouted && <Row label="" value={<span className="text-amber-400 text-xs">Opponent routed</span>} />}
      </div>
      <p className="text-xs text-muted-foreground">
        Once submitted, your opponent will be asked to confirm. The post-battle sequence unlocks after confirmation.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}
