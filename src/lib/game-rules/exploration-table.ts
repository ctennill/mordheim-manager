// Exploration table per PRD-006 §4.6
// Each exploring Hero rolls 1D6; total of all dice determines result

export type ExplorationOutcome = 'nothing' | 'gold' | 'item' | 'territory' | 'special'

export interface ExplorationResult {
  minRoll: number
  maxRoll: number
  name: string
  description: string
  outcome: ExplorationOutcome
  goldAmount?: number   // flat gold reward
  itemHint?: string     // equipment type hint
  flavor: string
}

export const EXPLORATION_TABLE: ExplorationResult[] = [
  {
    minRoll: 1, maxRoll: 5,
    name: 'Nothing Found',
    description: 'Your warband searches the ruins but finds nothing of value.',
    outcome: 'nothing',
    flavor: 'The crumbling streets yield only dust and echoes.',
  },
  {
    minRoll: 6, maxRoll: 6,
    name: 'Well',
    description: 'You discover an old well — a valuable territory claim.',
    outcome: 'territory',
    flavor: 'Fresh water is more precious than gold in the City of the Damned.',
  },
  {
    minRoll: 7, maxRoll: 7,
    name: 'Statue of Sigmar',
    description: 'A shrine to Sigmar grants +1 to the next campaign roll.',
    outcome: 'special',
    flavor: '"Sigmar protects." The statue glows faintly in the miasma.',
    goldAmount: 0,
  },
  {
    minRoll: 8, maxRoll: 8,
    name: 'Unusual Herbs',
    description: 'Medicinal herbs worth D6×5 gold crowns.',
    outcome: 'gold',
    goldAmount: 0, // computed as D6×5 at runtime
    flavor: 'Strange plants grow in the tainted soil — useful to an apothecary.',
  },
  {
    minRoll: 9, maxRoll: 9,
    name: 'Hidden Tome',
    description: 'An ancient grimoire. A wizard hero can learn a random spell; otherwise sell for 50 gc.',
    outcome: 'gold',
    goldAmount: 50,
    flavor: 'The tome hums with eldritch energy. Best not to read it aloud.',
  },
  {
    minRoll: 10, maxRoll: 10,
    name: 'Dwarf Map',
    description: 'An old map to a Dwarf treasure cache worth D6×10 gold crowns.',
    outcome: 'gold',
    goldAmount: 0, // D6×10
    flavor: 'The dwarfs kept detailed records — including their hoards.',
  },
  {
    minRoll: 11, maxRoll: 11,
    name: 'Shrine',
    description: 'A hidden shrine worth 2D6×5 gold crowns in holy relics.',
    outcome: 'gold',
    goldAmount: 0, // 2D6×5
    flavor: 'Someone hid these relics and never came back for them.',
  },
  {
    minRoll: 12, maxRoll: 12,
    name: "Alchemist's Laboratory",
    description: 'Arcane equipment worth D6×15 gold crowns.',
    outcome: 'gold',
    goldAmount: 0, // D6×15
    flavor: 'Bubbling retorts and strange powders — chaos touched but valuable.',
  },
  {
    minRoll: 13, maxRoll: 13,
    name: 'Smithy',
    description: 'A working forge. Purchase any Common weapon at half price this post-battle.',
    outcome: 'special',
    flavor: 'The bellows still breathe. The anvil still rings.',
  },
  {
    minRoll: 14, maxRoll: 14,
    name: 'Gunsmith',
    description: 'Purchase any blackpowder weapon at half price this post-battle.',
    outcome: 'special',
    flavor: 'Dwarf-make pistols, still in their oiled wrappings.',
  },
  {
    minRoll: 15, maxRoll: 15,
    name: 'Clothier',
    description: 'Purchase any armour at half price this post-battle.',
    outcome: 'special',
    flavor: 'Bolts of cloth and finished armour — untouched by looters.',
  },
  {
    minRoll: 16, maxRoll: 16,
    name: 'Carpenter',
    description: 'Repair all damaged equipment free of charge.',
    outcome: 'special',
    flavor: 'Tools, timber, and a craftsman\'s touch.',
  },
  {
    minRoll: 17, maxRoll: 17,
    name: 'Garden of Morr',
    description: 'Holy ground. One dead warrior may be resurrected on D6 roll of 4+.',
    outcome: 'special',
    flavor: 'The god of death watches over this place — but even he grants second chances.',
  },
  {
    minRoll: 18, maxRoll: 99,
    name: 'Catacombs',
    description: 'Roll D3 additional times on the exploration table.',
    outcome: 'special',
    flavor: 'Beneath Mordheim lie endless vaults of Wyrdstone-lit passages.',
  },
]

export function getExplorationResult(total: number): ExplorationResult {
  const entry = EXPLORATION_TABLE.find(e => total >= e.minRoll && total <= e.maxRoll)
  return entry ?? EXPLORATION_TABLE[0]
}

export function rollD6(): number {
  return Math.ceil(Math.random() * 6)
}

/** Resolve variable gold amounts (returns a resolved gold value and the roll description) */
export function resolveExplorationGold(result: ExplorationResult): { gold: number; rollDesc: string } {
  switch (result.name) {
    case 'Unusual Herbs': {
      const roll = rollD6()
      return { gold: roll * 5, rollDesc: `D6(${roll})×5` }
    }
    case 'Dwarf Map': {
      const roll = rollD6()
      return { gold: roll * 10, rollDesc: `D6(${roll})×10` }
    }
    case 'Shrine': {
      const r1 = rollD6(); const r2 = rollD6()
      return { gold: (r1 + r2) * 5, rollDesc: `2D6(${r1}+${r2})×5` }
    }
    case "Alchemist's Laboratory": {
      const roll = rollD6()
      return { gold: roll * 15, rollDesc: `D6(${roll})×15` }
    }
    case 'Hidden Tome':
      return { gold: 50, rollDesc: 'Fixed 50 gc' }
    default:
      return { gold: result.goldAmount ?? 0, rollDesc: '' }
  }
}
