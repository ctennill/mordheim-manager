'use client'

import { useState } from 'react'

const STATS = [
  { key: 'move',            label: 'M'  },
  { key: 'weapon_skill',    label: 'WS' },
  { key: 'ballistic_skill', label: 'BS' },
  { key: 'strength',        label: 'S'  },
  { key: 'toughness',       label: 'T'  },
  { key: 'wounds',          label: 'W'  },
  { key: 'initiative',      label: 'I'  },
  { key: 'attacks',         label: 'A'  },
  { key: 'leadership',      label: 'Ld' },
] as const

type StatKey = (typeof STATS)[number]['key']

interface StatGridProps {
  initialValues?: Partial<Record<StatKey, number>>
}

const DEFAULTS: Record<StatKey, number> = {
  move: 4, weapon_skill: 3, ballistic_skill: 3,
  strength: 3, toughness: 3, wounds: 1,
  initiative: 3, attacks: 1, leadership: 7,
}

export function StatGrid({ initialValues }: StatGridProps) {
  const [values, setValues] = useState<Record<StatKey, number>>(
    { ...DEFAULTS, ...initialValues }
  )

  return (
    <div className="grid grid-cols-9 gap-1">
      {STATS.map(({ key, label }) => (
        <div key={key} className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-mono text-muted-foreground/70 uppercase">{label}</span>
          <input
            type="number"
            name={key}
            min={0}
            max={10}
            value={values[key]}
            onChange={e => setValues(v => ({ ...v, [key]: parseInt(e.target.value, 10) || 0 }))}
            className="w-full text-center px-0 py-1 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:border-gold/40 font-mono"
          />
        </div>
      ))}
    </div>
  )
}

// Modifier grid for equipment (nullable, allows negatives)
const MOD_STATS = [
  { key: 'mod_move',            label: 'M'  },
  { key: 'mod_weapon_skill',    label: 'WS' },
  { key: 'mod_ballistic_skill', label: 'BS' },
  { key: 'mod_strength',        label: 'S'  },
  { key: 'mod_toughness',       label: 'T'  },
  { key: 'mod_wounds',          label: 'W'  },
  { key: 'mod_initiative',      label: 'I'  },
  { key: 'mod_attacks',         label: 'A'  },
  { key: 'mod_leadership',      label: 'Ld' },
] as const

type ModKey = (typeof MOD_STATS)[number]['key']

interface ModGridProps {
  initialValues?: Partial<Record<ModKey, number | null>>
}

export function ModGrid({ initialValues = {} }: ModGridProps) {
  const [values, setValues] = useState<Record<ModKey, string>>(
    Object.fromEntries(
      MOD_STATS.map(({ key }) => [key, initialValues[key] != null ? String(initialValues[key]) : ''])
    ) as Record<ModKey, string>
  )

  return (
    <div className="grid grid-cols-9 gap-1">
      {MOD_STATS.map(({ key, label }) => (
        <div key={key} className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-mono text-muted-foreground/70 uppercase">{label}</span>
          <input
            type="number"
            name={key}
            min={-5}
            max={5}
            value={values[key]}
            onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
            placeholder="—"
            className="w-full text-center px-0 py-1 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:border-gold/40 font-mono placeholder:text-muted-foreground/30"
          />
        </div>
      ))}
    </div>
  )
}
