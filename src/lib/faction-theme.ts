// Visual theming for the 10 official launch factions
// Colors use Tailwind CSS classes

export interface FactionTheme {
  icon: string       // emoji stand-in until artwork is added
  accentClass: string  // Tailwind text color class for accent
  borderClass: string  // Tailwind border color class
  bgClass: string      // Tailwind bg tint class for card hover
  alignment: 'law' | 'neutral' | 'chaos'
}

export const FACTION_THEMES: Record<string, FactionTheme> = {
  'Reiklanders': {
    icon: '🦅',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-400/40',
    bgClass: 'hover:bg-amber-400/5',
    alignment: 'law',
  },
  'Marienburg Merchants': {
    icon: '⚓',
    accentClass: 'text-sky-400',
    borderClass: 'border-sky-400/40',
    bgClass: 'hover:bg-sky-400/5',
    alignment: 'neutral',
  },
  'Middenheim Mercenaries': {
    icon: '🐺',
    accentClass: 'text-slate-300',
    borderClass: 'border-slate-300/40',
    bgClass: 'hover:bg-slate-300/5',
    alignment: 'neutral',
  },
  'Undead': {
    icon: '💀',
    accentClass: 'text-violet-400',
    borderClass: 'border-violet-400/40',
    bgClass: 'hover:bg-violet-400/5',
    alignment: 'chaos',
  },
  'Skaven': {
    icon: '🐀',
    accentClass: 'text-green-400',
    borderClass: 'border-green-400/40',
    bgClass: 'hover:bg-green-400/5',
    alignment: 'chaos',
  },
  'Sisters of Sigmar': {
    icon: '⚡',
    accentClass: 'text-yellow-300',
    borderClass: 'border-yellow-300/40',
    bgClass: 'hover:bg-yellow-300/5',
    alignment: 'law',
  },
  'Witch Hunters': {
    icon: '🔥',
    accentClass: 'text-orange-400',
    borderClass: 'border-orange-400/40',
    bgClass: 'hover:bg-orange-400/5',
    alignment: 'law',
  },
  'Orcs & Goblins': {
    icon: '🪓',
    accentClass: 'text-lime-400',
    borderClass: 'border-lime-400/40',
    bgClass: 'hover:bg-lime-400/5',
    alignment: 'neutral',
  },
  'Cult of the Possessed': {
    icon: '👁️',
    accentClass: 'text-red-400',
    borderClass: 'border-red-400/40',
    bgClass: 'hover:bg-red-400/5',
    alignment: 'chaos',
  },
  'Beastmen Raiders': {
    icon: '🐏',
    accentClass: 'text-rose-400',
    borderClass: 'border-rose-400/40',
    bgClass: 'hover:bg-rose-400/5',
    alignment: 'chaos',
  },
}

export const ALIGNMENT_LABELS: Record<string, { label: string; className: string }> = {
  law:     { label: 'Law',     className: 'text-sky-400 border-sky-400/40' },
  neutral: { label: 'Neutral', className: 'text-zinc-400 border-zinc-400/40' },
  chaos:   { label: 'Chaos',   className: 'text-red-400 border-red-400/40' },
}

export function getFactionTheme(name: string): FactionTheme {
  return FACTION_THEMES[name] ?? {
    icon: '⚔️',
    accentClass: 'text-gold',
    borderClass: 'border-gold/40',
    bgClass: 'hover:bg-gold/5',
    alignment: 'neutral',
  }
}
