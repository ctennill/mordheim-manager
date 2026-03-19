import { create } from 'zustand'
import { type FactionPosition, type Equipment } from '@/types/database'

export type WarbandBuilderStep = 'faction' | 'name' | 'heroes' | 'henchmen' | 'equip' | 'review'

export interface HeroEntry {
  tempId: string
  positionId: string
  position: FactionPosition
  name: string
  equipment: Equipment[]
}

export interface HenchmanEntry {
  tempId: string
  positionId: string
  position: FactionPosition
  count: number
  equipment: Equipment[]
}

interface WarbandBuilderState {
  step: WarbandBuilderStep
  factionId: string | null
  warbandName: string
  motto: string
  background: string
  heroes: HeroEntry[]
  henchmen: HenchmanEntry[]
  startingGold: number

  // Actions
  setStep: (step: WarbandBuilderStep) => void
  setFaction: (factionId: string, startingGold?: number) => void
  setWarbandName: (name: string) => void
  setMotto: (motto: string) => void
  setBackground: (bg: string) => void
  addHero: (position: FactionPosition) => void
  removeHero: (tempId: string) => void
  updateHeroName: (tempId: string, name: string) => void
  addHeroEquipment: (tempId: string, equipment: Equipment) => void
  removeHeroEquipment: (tempId: string, equipmentId: string) => void
  addHenchmanGroup: (position: FactionPosition) => void
  removeHenchmanGroup: (tempId: string) => void
  updateHenchmanCount: (tempId: string, count: number) => void
  addHenchmanEquipment: (tempId: string, equipment: Equipment) => void
  removeHenchmanEquipment: (tempId: string, equipmentId: string) => void
  reset: () => void

  // Derived
  goldSpent: () => number
  goldRemaining: () => number
  totalModels: () => number
}

const DEFAULT_STARTING_GOLD = 500

function generateTempId() {
  return Math.random().toString(36).slice(2)
}

export const useWarbandBuilder = create<WarbandBuilderState>((set, get) => ({
  step: 'faction',
  factionId: null,
  warbandName: '',
  motto: '',
  background: '',
  heroes: [],
  henchmen: [],
  startingGold: DEFAULT_STARTING_GOLD,

  setStep: (step) => set({ step }),
  setFaction: (factionId, startingGold = DEFAULT_STARTING_GOLD) =>
    set({ factionId, startingGold, heroes: [], henchmen: [] }),
  setWarbandName: (warbandName) => set({ warbandName }),
  setMotto: (motto) => set({ motto }),
  setBackground: (background) => set({ background }),

  addHero: (position) =>
    set((state) => ({
      heroes: [
        ...state.heroes,
        { tempId: generateTempId(), positionId: position.id, position, name: '', equipment: [] },
      ],
    })),

  removeHero: (tempId) =>
    set((state) => ({ heroes: state.heroes.filter((h) => h.tempId !== tempId) })),

  updateHeroName: (tempId, name) =>
    set((state) => ({
      heroes: state.heroes.map((h) => (h.tempId === tempId ? { ...h, name } : h)),
    })),

  addHeroEquipment: (tempId, equipment) =>
    set((state) => ({
      heroes: state.heroes.map((h) =>
        h.tempId === tempId ? { ...h, equipment: [...h.equipment, equipment] } : h
      ),
    })),

  removeHeroEquipment: (tempId, equipmentId) =>
    set((state) => ({
      heroes: state.heroes.map((h) =>
        h.tempId === tempId
          ? { ...h, equipment: h.equipment.filter((e) => e.id !== equipmentId) }
          : h
      ),
    })),

  addHenchmanGroup: (position) =>
    set((state) => ({
      henchmen: [
        ...state.henchmen,
        { tempId: generateTempId(), positionId: position.id, position, count: 1, equipment: [] },
      ],
    })),

  removeHenchmanGroup: (tempId) =>
    set((state) => ({ henchmen: state.henchmen.filter((h) => h.tempId !== tempId) })),

  updateHenchmanCount: (tempId, count) =>
    set((state) => ({
      henchmen: state.henchmen.map((h) => (h.tempId === tempId ? { ...h, count } : h)),
    })),

  addHenchmanEquipment: (tempId, equipment) =>
    set((state) => ({
      henchmen: state.henchmen.map((h) =>
        h.tempId === tempId ? { ...h, equipment: [...h.equipment, equipment] } : h
      ),
    })),

  removeHenchmanEquipment: (tempId, equipmentId) =>
    set((state) => ({
      henchmen: state.henchmen.map((h) =>
        h.tempId === tempId
          ? { ...h, equipment: h.equipment.filter((e) => e.id !== equipmentId) }
          : h
      ),
    })),

  reset: () =>
    set({
      step: 'faction',
      factionId: null,
      warbandName: '',
      motto: '',
      background: '',
      heroes: [],
      henchmen: [],
      startingGold: DEFAULT_STARTING_GOLD,
    }),

  goldSpent: () => {
    const { heroes, henchmen } = get()
    const heroCost = heroes.reduce(
      (sum, h) =>
        sum + h.position.cost + h.equipment.reduce((es, e) => es + e.cost, 0),
      0
    )
    const henchmanCost = henchmen.reduce(
      (sum, h) =>
        sum + h.count * h.position.cost + h.equipment.reduce((es, e) => es + e.cost, 0),
      0
    )
    return heroCost + henchmanCost
  },

  goldRemaining: () => get().startingGold - get().goldSpent(),

  totalModels: () => {
    const { heroes, henchmen } = get()
    return heroes.length + henchmen.reduce((sum, h) => sum + h.count, 0)
  },
}))
