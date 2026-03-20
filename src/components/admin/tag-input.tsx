'use client'

import { useState } from 'react'

interface TagInputProps {
  name: string
  initialTags?: string[]
  placeholder?: string
  suggestions?: string[]
}

export function TagInput({ name, initialTags = [], placeholder = 'Add tag, press Enter', suggestions = [] }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [input, setInput] = useState('')

  function addTag(value: string) {
    const v = value.trim()
    if (v && !tags.includes(v)) {
      setTags(prev => [...prev, v])
    }
    setInput('')
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s))

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(tags)} />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-white/10 border border-border text-foreground">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-muted-foreground hover:text-foreground ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); addTag(input) }
              if (e.key === 'Backspace' && !input && tags.length > 0) {
                setTags(prev => prev.slice(0, -1))
              }
            }}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40"
          />
          <button
            type="button"
            onClick={() => addTag(input)}
            className="px-3 py-1.5 text-xs border border-border rounded text-muted-foreground hover:text-foreground hover:border-gold/40 transition-colors"
          >
            Add
          </button>
        </div>

        {filtered.length > 0 && input && (
          <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-card border border-border rounded shadow-lg max-h-40 overflow-y-auto">
            {filtered.slice(0, 8).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-white/5 text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
