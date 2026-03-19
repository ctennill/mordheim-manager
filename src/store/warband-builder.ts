import { create } from 'zustand'
import { type FactionPosition, type Equipment } from '@/types/database'

export type WarbandBuilderStep = 'faction' | 'name' | 'heroes' | 'henchmen' | 'equip' | 'review'

// Equipment is tracked with quantity so the sheet can show +/- controls cleanly
export interface EquipmentEntry {
  item: Equipment
  quantity: number
}

export interface HeroEntry {
  tempId: string
  positionId: string
  position: FactionPosition
  name: string
  equipment: EquipmentEntry[]
}

export interface HenchmanEntry {
  tempId: string
  positionId: string
  position: FactionPosition
  count: number
  equipment: EquipmentEntry[]
}

interface WarbandBuilderState {
  step: WarbandBuilderStep
  factionId: string | null
  factionName: string | null
  warbandName: string
  motto: string
  background: string
  heroes: HeroEntry[]
  henchmen: HenchmanEntry[]
  startingGold: number

  // Actions
  setStep: (step: WarbandBuilderStep) => void
  setFaction: (factionId: string, factionName: string, startingGold?: number) => void
  setWarbandName: (name: string) => void
  setMotto: (motto: string) => void
  setBackground: (bg: string) => void
  addHero: (position: FactionPosition) => void
  removeHero: (tempId: string) => void
  updateHeroName: (tempId: string, name: string) => void
  setHeroEquipmentQty: (tempId: string, item: Equipment, quantity: number) => void
  addHenchmanGroup: (position: FactionPosition) => void
  removeHenchmanGroup: (tempId: string) => void
  updateHenchmanCount: (tempId: string, count: number) => void
  setHenchmanEquipmentQty: (tempId: string, item: Equipment, quantity: number) => void
  reset: () => void

  // Derived
  goldSpent: () => number
  goldRemaining: () => number
  totalModels: () => number
  heroesCost: () => number
  henchmenCost: () => number
  equipmentCost: () => number
}

const DEFAULT_STARTING_GOLD = 500

function generateTempId() {
  return Math.random().toString(36).slice(2)
}

function setEquipmentQty(entries: EquipmentEntry[], item: Equipment, quantity: number): EquipmentEntry[] {
  if (quantity <= 0) return entries.filter((e) => e.item.id !== item.id)
  const existing = entries.find((e) => e.item.id === item.id)
  if (existing) return entries.map((e) => (e.item.id === item.id ? { ...e, quantity } : e))
  return [...entries, { item, quantity }]
}

export const useWarbandBuilder = create<WarbandBuilderState>((set, get) => ({
  step: 'faction',
  factionId: null,
  factionName: null,
  warbandName: '',
  motto: '',
  background: '',
  heroes: [],
  henchmen: [],
  startingGold: DEFAULT_STARTING_GOLD,

  setStep: (step) => set({ step }),

  setFaction: (factionId, factionName, startingGold = DEFAULT_STARTING_GOLD) =>
    set({ factionId, factionName, startingGold, heroes: [], henchmen: [] }),

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

  setHeroEquipmentQty: (tempId, item, quantity) =>
    set((state) => ({
      heroes: state.heroes.map((h) =>
        h.tempId === tempId
          ? { ...h, equipment: setEquipmentQty(h.equipment, item, quantity) }
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

  setHenchmanEquipmentQty: (tempId, item, quantity) =>
    set((state) => ({
      henchmen: state.henchmen.map((h) =>
        h.tempId === tempId
          ? { ...h, equipment: setEquipmentQty(h.equipment, item, quantity) }
          : h
      ),
    })),

  reset: () =>
    set({
      step: 'faction',
      factionId: null,
      factionName: null,
      warbandName: '',
      motto: '',
      background: '',
      heroes: [],
      henchmen: [],
      startingGold: DEFAULT_STARTING_GOLD,
    }),

  heroesCost: () =>
    get().heroes.reduce((sum, h) => sum + h.position.cost, 0),

  henchmenCost: () =>
    get().henchmen.reduce((sum, h) => sum + h.count * h.position.cost, 0),

  equipmentCost: () => {
    const { heroes, henchmen } = get()
    const heroEq = heroes.reduce(
      (sum, h) => sum + h.equipment.reduce((s, e) => s + e.item.cost * e.quantity, 0),
      0
    )
    const henchEq = henchmen.reduce(
      (sum, h) => sum + h.equipment.reduce((s, e) => s + e.item.cost * e.quantity, 0),
      0
    )
    return heroEq + henchEq
  },

  goldSpent: () => get().heroesCost() + get().henchmenCost() + get().equipmentCost(),

  goldRemaining: () => get().startingGold - get().goldSpent(),

  totalModels: () => {
    const { heroes, henchmen } = get()
    return heroes.length + henchmen.reduce((sum, h) => sum + h.count, 0)
  },
}))
