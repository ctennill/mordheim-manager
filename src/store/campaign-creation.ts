import { create } from 'zustand'
import { type CampaignMode, type CampaignPrivacy, type PairingMethod } from '@/types/database'

export interface CampaignCreationState {
  step: number // 1–5

  // Step 1 — Basics
  name: string
  mode: CampaignMode
  location: string
  privacy: CampaignPrivacy
  description: string

  // Step 2 — Rules
  ruleset: string
  startingGold: number
  startingXpBonus: number
  maxWarbandSize: number
  maxWarbands: number
  hiredSwordsEnabled: boolean
  dramatisPersonaeEnabled: boolean
  magicItemsSetting: 'core' | 'all' | 'disabled'
  alignmentRulesEnabled: boolean

  // Step 3 — Faction availability
  allowAllOfficial: boolean
  allowSupplements: boolean
  allowedFactionIds: string[] | null // null = all allowed; set = restricted
  factionSlots: Record<string, number> // factionId → max slots (0 = blocked)

  // Step 4 — Session structure
  totalSessions: number | null // null = open-ended
  pairingMethod: PairingMethod

  // Step 5 — Scoring
  pointsWin: number
  pointsDraw: number
  pointsLoss: number

  // Actions
  setStep: (step: number) => void
  set: (partial: Partial<CampaignCreationState>) => void
  toggleFaction: (factionId: string, factionType: string) => void
  setFactionSlot: (factionId: string, slots: number) => void
  reset: () => void
}

const DEFAULTS: Omit<CampaignCreationState, 'setStep' | 'set' | 'toggleFaction' | 'setFactionSlot' | 'reset'> = {
  step: 1,
  name: '',
  mode: 'standard',
  location: '',
  privacy: 'public',
  description: '',
  ruleset: 'core',
  startingGold: 500,
  startingXpBonus: 0,
  maxWarbandSize: 15,
  maxWarbands: 12,
  hiredSwordsEnabled: true,
  dramatisPersonaeEnabled: true,
  magicItemsSetting: 'core',
  alignmentRulesEnabled: false,
  allowAllOfficial: true,
  allowSupplements: false,
  allowedFactionIds: null,
  factionSlots: {},
  totalSessions: 8,
  pairingMethod: 'commissioner',
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
}

export const useCampaignCreation = create<CampaignCreationState>((setState, get) => ({
  ...DEFAULTS,

  setStep: (step) => setState({ step }),

  set: (partial) => setState(partial),

  toggleFaction: (factionId, factionType) => {
    const state = get()
    // If currently allowing all (allowedFactionIds === null), switch to explicit list first
    const currentIds = state.allowedFactionIds ?? []
    if (state.allowedFactionIds === null) {
      // Don't allow toggling when in "all allowed" mode — use the allow toggles instead
      return
    }
    const isAllowed = currentIds.includes(factionId)
    setState({
      allowedFactionIds: isAllowed
        ? currentIds.filter((id) => id !== factionId)
        : [...currentIds, factionId],
    })
  },

  setFactionSlot: (factionId, slots) =>
    setState((s) => ({ factionSlots: { ...s.factionSlots, [factionId]: slots } })),

  reset: () => setState(DEFAULTS),
}))
