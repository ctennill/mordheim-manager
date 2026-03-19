'use client'

import { usePostBattle } from '@/store/post-battle'

export function StepSubmit() {
  const {
    oaaWarriors, xpEntries, explorationOutcomes, advancementQueue,
    totalIncome, goldSpent, spendNotes,
    treasuryBefore,
  } = usePostBattle()

  const explorationGold = explorationOutcomes.reduce((s, o) => s + o.goldResolved, 0)
  const totalGold = treasuryBefore + totalIncome + explorationGold - goldSpent

  const injuries = oaaWarriors.filter((w) => w.result && w.result.effect !== 'none')
  const deaths = oaaWarriors.filter((w) => w.result?.effect === 'dead' ||
    w.subRolls.some((sr) => sr.result.effect === 'dead'))
  const totalXpGained = xpEntries.reduce((s, e) => s + e.xpGained, 0)
  const advances = advancementQueue.filter((a) => a.applied)

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review all changes before submitting. Once submitted, your warband roster will be updated.
      </p>

      <div className="rounded-md border border-border bg-card divide-y divide-border">
        <Section title="Injuries">
          {oaaWarriors.length === 0 ? (
            <p className="text-xs text-muted-foreground">No warriors went Out of Action.</p>
          ) : (
            <ul className="space-y-1">
              {oaaWarriors.map((w) => {
                const finalResult = deaths.find((d) => d.warriorId === w.warriorId) ? 'Dead' : w.result?.name ?? '—'
                const color = finalResult === 'Dead' ? 'text-red-500'
                  : w.result?.effect === 'miss_next_battle' ? 'text-amber-400'
                  : w.result?.effect === 'stat_modifier' ? 'text-orange-400'
                  : 'text-muted-foreground'
                return (
                  <li key={w.warriorId} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{w.warriorName}</span>
                    <span className={color}>{finalResult}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>

        <Section title="Experience">
          <ul className="space-y-1">
            {xpEntries.filter((e) => e.xpGained > 0).map((e) => (
              <li key={e.warriorId} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{e.warriorName}</span>
                <span className="text-emerald-400 font-mono">+{e.xpGained} XP → {e.currentXp + e.xpGained}</span>
              </li>
            ))}
            {xpEntries.every((e) => e.xpGained === 0) && (
              <li className="text-xs text-muted-foreground">No XP gained.</li>
            )}
          </ul>
        </Section>

        <Section title="Advancements">
          {advances.length === 0 ? (
            <p className="text-xs text-muted-foreground">No advancements this battle.</p>
          ) : (
            <ul className="space-y-1">
              {advances.map((a, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{a.warriorName}</span>
                  <span className="text-gold">
                    {a.chosenSkill ? `New skill: ${a.chosenSkill}`
                      : a.chosenStat ? `+1 ${a.chosenStat}`
                      : `Roll ${a.roll2d6}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Gold">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Income</span>
              <span className="font-mono text-emerald-400">+{totalIncome + explorationGold} gc</span>
            </div>
            {goldSpent > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-mono text-muted-foreground">−{goldSpent} gc</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">New Treasury</span>
              <span className="font-mono text-gold">{totalGold} gc</span>
            </div>
          </div>
        </Section>

        {explorationOutcomes.length > 0 && (
          <Section title="Exploration">
            <ul className="space-y-1">
              {explorationOutcomes.map((o, i) => (
                <li key={i} className="text-xs text-foreground">
                  {o.result.name}
                  {o.goldResolved > 0 && <span className="text-gold ml-1.5">+{o.goldResolved} gc</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {spendNotes && (
          <Section title="Purchases">
            <p className="text-xs text-muted-foreground">{spendNotes}</p>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 space-y-2">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/60">{title}</p>
      {children}
    </div>
  )
}
