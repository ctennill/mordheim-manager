'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ApprovalActionsProps {
  campaignId: string
  playerId: string
}

export function ApprovalActions({ campaignId, playerId }: ApprovalActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function handle(action: 'approve' | 'reject') {
    setLoading(action)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/players/${playerId}/${action}`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        toast.error(data.error ?? `Failed to ${action} player`)
        return
      }
      toast.success(action === 'approve' ? 'Player approved' : 'Player rejected')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handle('approve')}
        disabled={loading !== null}
        className="px-3 py-1 text-xs rounded border border-emerald-500/40 text-emerald-400 hover:bg-emerald-400/10 transition-colors disabled:opacity-50"
      >
        {loading === 'approve' ? '…' : 'Approve'}
      </button>
      <button
        onClick={() => handle('reject')}
        disabled={loading !== null}
        className="px-3 py-1 text-xs rounded border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
      >
        {loading === 'reject' ? '…' : 'Reject'}
      </button>
    </div>
  )
}
