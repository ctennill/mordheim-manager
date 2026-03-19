import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type InjuryResult } from '@/lib/game-rules/injury-table'
import { type ExplorationResult } from '@/lib/game-rules/exploration-table'
import { calcWyrdstoneIncome } from '@/lib/game-rules/wyrdstone-income'
import { getHeroAdvancementCount } from '@/lib/game-rules/xp-thresholds'

// ─── Sub-types ───────────────────────────────────────────────────────────────

export interface WarriorInjuryEntry {
  warriorId: string
  warriorName: string
  isHero: boolean
  d66Roll: string | null
  result: InjuryResult | null
  subRolls: { d66: string; result: InjuryResult }[]
  resolvedGoldLoss: number
  applied: boolean
}

export interface HeroExplorationEntry {
  warriorId: string
  warriorName: string
  dieRoll: number | null
}

export interface ExplorationOutcomeEntry {
  result: ExplorationResult
  goldResolved: number
  rollDesc: string
  isBonus: boolean
}

export interface WarriorXpEntry {
  warriorId: string
  warriorName: string
  isHero: boolean
  currentXp: number
  xpGained: number
  advancementsTaken: number
}

export interface AdvancementEntry {
  warriorId: string
  warriorName: string
  advanceIndex: number
  roll2d6: number | null
  chosenStat: string | null
  chosenSkill: string | null
  applied: boolean
}

export type PostBattleStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

// ─── State interface ─────────────────────────────────────────────────────────

export interface PostBattleState {
  battleId: string | null
  warbandId: string | null
  side: 'a' | 'b' | null
  step: PostBattleStep
  submitted: boolean

  // Step 1 – Injuries
  oaaWarriors: WarriorInjuryEntry[]

  // Step 2 – Captives
  captiveChoices: Record<string, 'ransom' | 'free' | 'execute'>

  // Step 3 – Income
  wyrdstoneShards: number
  baseWyrdstoneIncome: number
  miscIncome: number
  totalIncome: number
  treasuryBefore: number

  // Step 4 – Exploration
  exploringHeroes: HeroExplorationEntry[]
  explorationOutcomes: ExplorationOutcomeEntry[]

  // Step 5 – XP
  xpEntries: WarriorXpEntry[]

  // Step 6 – Advancements
  advancementQueue: AdvancementEntry[]

  // Step 7 – Spend
  goldSpent: number
  spendNotes: string

  // ── Actions ──────────────────────────────────────────────────────────────

  init: (opts: {
    battleId: string
    warbandId: string
    side: 'a' | 'b'
    oaaWarriors: Pick<WarriorInjuryEntry, 'warriorId' | 'warriorName' | 'isHero'>[]
    exploringHeroes: Pick<HeroExplorationEntry, 'warriorId' | 'warriorName'>[]
    xpEntries: WarriorXpEntry[]
    wyrdstoneShards: number
    treasuryBefore: number
  }) => void

  setStep: (step: PostBattleStep) => void

  // Step 1
  setInjuryRoll: (warriorId: string, d66: string, result: InjuryResult, subRolls?: { d66: string; result: InjuryResult }[]) => void
  setGoldLoss: (warriorId: string, amount: number) => void
  markInjuryApplied: (warriorId: string) => void

  // Step 2
  setCaptiveChoice: (warriorId: string, choice: 'ransom' | 'free' | 'execute') => void

  // Step 3
  setMiscIncome: (amount: number) => void

  // Step 4
  setHeroExplorationRoll: (warriorId: string, roll: number) => void
  setExplorationOutcomes: (outcomes: ExplorationOutcomeEntry[]) => void

  // Step 5
  setXpGain: (warriorId: string, xpGained: number) => void
  buildAdvancementQueue: () => void

  // Step 6
  setAdvancementRoll: (warriorId: string, advanceIndex: number, roll: number) => void
  setAdvancementChoice: (warriorId: string, advanceIndex: number, chosenStat?: string, chosenSkill?: string) => void
  markAdvancementApplied: (warriorId: string, advanceIndex: number) => void

  // Step 7
  setGoldSpent: (amount: number) => void
  setSpendNotes: (notes: string) => void

  reset: () => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const usePostBattle = create<PostBattleState>()(
  persist(
    (setState, get) => ({
      battleId: null,
      warbandId: null,
      side: null,
      step: 1 as PostBattleStep,
      submitted: false,
      oaaWarriors: [],
      captiveChoices: {},
      wyrdstoneShards: 0,
      baseWyrdstoneIncome: 0,
      miscIncome: 0,
      totalIncome: 0,
      treasuryBefore: 0,
      exploringHeroes: [],
      explorationOutcomes: [],
      xpEntries: [],
      advancementQueue: [],
      goldSpent: 0,
      spendNotes: '',

      init: ({ battleId, warbandId, side, oaaWarriors, exploringHeroes, xpEntries, wyrdstoneShards, treasuryBefore }) => {
        const base = calcWyrdstoneIncome(wyrdstoneShards)
        setState({
          battleId, warbandId, side,
          step: 1,
          submitted: false,
          wyrdstoneShards,
          baseWyrdstoneIncome: base,
          miscIncome: 0,
          totalIncome: base,
          treasuryBefore,
          oaaWarriors: oaaWarriors.map((w) => ({
            ...w, d66Roll: null, result: null, subRolls: [], resolvedGoldLoss: 0, applied: false,
          })),
          captiveChoices: {},
          exploringHeroes: exploringHeroes.map((h) => ({ ...h, dieRoll: null })),
          explorationOutcomes: [],
          xpEntries,
          advancementQueue: [],
          goldSpent: 0,
          spendNotes: '',
        })
      },

      setStep: (step) => setState({ step }),

      setInjuryRoll: (warriorId, d66, result, subRolls = []) =>
        setState((s) => ({
          oaaWarriors: s.oaaWarriors.map((w) =>
            w.warriorId === warriorId ? { ...w, d66Roll: d66, result, subRolls } : w
          ),
        })),

      setGoldLoss: (warriorId, amount) =>
        setState((s) => ({
          oaaWarriors: s.oaaWarriors.map((w) =>
            w.warriorId === warriorId ? { ...w, resolvedGoldLoss: amount } : w
          ),
        })),

      markInjuryApplied: (warriorId) =>
        setState((s) => ({
          oaaWarriors: s.oaaWarriors.map((w) =>
            w.warriorId === warriorId ? { ...w, applied: true } : w
          ),
        })),

      setCaptiveChoice: (warriorId, choice) =>
        setState((s) => ({ captiveChoices: { ...s.captiveChoices, [warriorId]: choice } })),

      setMiscIncome: (amount) =>
        setState((s) => ({
          miscIncome: amount,
          totalIncome: s.baseWyrdstoneIncome + amount,
        })),

      setHeroExplorationRoll: (warriorId, roll) =>
        setState((s) => ({
          exploringHeroes: s.exploringHeroes.map((h) =>
            h.warriorId === warriorId ? { ...h, dieRoll: roll } : h
          ),
        })),

      setExplorationOutcomes: (outcomes) => setState({ explorationOutcomes: outcomes }),

      setXpGain: (warriorId, xpGained) =>
        setState((s) => ({
          xpEntries: s.xpEntries.map((e) =>
            e.warriorId === warriorId ? { ...e, xpGained } : e
          ),
        })),

      buildAdvancementQueue: () => {
        const s = get()
        const queue: AdvancementEntry[] = []
        for (const entry of s.xpEntries) {
          if (!entry.isHero) continue
          const newXp = entry.currentXp + entry.xpGained
          const earned = getHeroAdvancementCount(newXp)
          for (let i = entry.advancementsTaken; i < earned; i++) {
            queue.push({
              warriorId: entry.warriorId,
              warriorName: entry.warriorName,
              advanceIndex: i + 1,
              roll2d6: null,
              chosenStat: null,
              chosenSkill: null,
              applied: false,
            })
          }
        }
        setState({ advancementQueue: queue })
      },

      setAdvancementRoll: (warriorId, advanceIndex, roll) =>
        setState((s) => ({
          advancementQueue: s.advancementQueue.map((a) =>
            a.warriorId === warriorId && a.advanceIndex === advanceIndex
              ? { ...a, roll2d6: roll }
              : a
          ),
        })),

      setAdvancementChoice: (warriorId, advanceIndex, chosenStat, chosenSkill) =>
        setState((s) => ({
          advancementQueue: s.advancementQueue.map((a) =>
            a.warriorId === warriorId && a.advanceIndex === advanceIndex
              ? { ...a, chosenStat: chosenStat ?? a.chosenStat, chosenSkill: chosenSkill ?? a.chosenSkill }
              : a
          ),
        })),

      markAdvancementApplied: (warriorId, advanceIndex) =>
        setState((s) => ({
          advancementQueue: s.advancementQueue.map((a) =>
            a.warriorId === warriorId && a.advanceIndex === advanceIndex
              ? { ...a, applied: true }
              : a
          ),
        })),

      setGoldSpent: (amount) => setState({ goldSpent: amount }),
      setSpendNotes: (notes) => setState({ spendNotes: notes }),

      reset: () =>
        setState({
          battleId: null, warbandId: null, side: null,
          step: 1, submitted: false,
          oaaWarriors: [], captiveChoices: {},
          wyrdstoneShards: 0, baseWyrdstoneIncome: 0, miscIncome: 0,
          totalIncome: 0, treasuryBefore: 0,
          exploringHeroes: [], explorationOutcomes: [],
          xpEntries: [], advancementQueue: [],
          goldSpent: 0, spendNotes: '',
        }),
    }),
    {
      name: 'post-battle-state',
      partialize: (s) => ({
        battleId: s.battleId,
        warbandId: s.warbandId,
        side: s.side,
        step: s.step,
        submitted: s.submitted,
        oaaWarriors: s.oaaWarriors,
        captiveChoices: s.captiveChoices,
        wyrdstoneShards: s.wyrdstoneShards,
        baseWyrdstoneIncome: s.baseWyrdstoneIncome,
        miscIncome: s.miscIncome,
        totalIncome: s.totalIncome,
        treasuryBefore: s.treasuryBefore,
        exploringHeroes: s.exploringHeroes,
        explorationOutcomes: s.explorationOutcomes,
        xpEntries: s.xpEntries,
        advancementQueue: s.advancementQueue,
        goldSpent: s.goldSpent,
        spendNotes: s.spendNotes,
      }),
    }
  )
)
