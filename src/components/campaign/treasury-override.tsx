'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TreasuryOverrideProps {
  campaignId: string
  warbandId: string
  currentTreasury: number
}

export function TreasuryOverride({ campaignId, warbandId, currentTreasury }: TreasuryOverrideProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const delta = parseInt(amount, 10)
    if (isNaN(delta)) {
      toast.error('Enter a valid number')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/warbands/${warbandId}/treasury`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: delta }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        toast.error(data.error ?? 'Failed to update treasury')
        return
      }
      const { treasury } = await res.json() as { treasury: number }
      toast.success(`Treasury updated to ${treasury} gc`)
      setOpen(false)
      setAmount('')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="ml-1 px-1.5 py-0.5 text-xs rounded border border-border text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors"
        title="Adjust treasury"
      >
        ±
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="inline-flex items-center gap-1 ml-1">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="±gc"
        className="w-16 px-1.5 py-0.5 text-xs rounded border border-border bg-background text-foreground focus:border-gold/60 outline-none"
        autoFocus
      />
      <button
        type="submit"
        disabled={loading}
        className="px-1.5 py-0.5 text-xs rounded border border-gold/40 text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
      >
        {loading ? '…' : '✓'}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setAmount('') }}
        className="px-1.5 py-0.5 text-xs rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        ✕
      </button>
    </form>
  )
}
