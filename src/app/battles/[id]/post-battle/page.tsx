'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePostBattle } from '@/store/post-battle'
import { PostBattleWizard } from '@/components/post-battle'

// This page initialises the post-battle store from the server and renders the wizard.
// It uses a client loader pattern — the data fetching happens client-side from the
// battle API since we need auth context to determine the user's side.

interface BattleData {
  battleId: string
  warbandId: string
  side: 'a' | 'b'
  oaaWarriors: { warriorId: string; warriorName: string; isHero: boolean }[]
  exploringHeroes: { warriorId: string; warriorName: string }[]
  xpEntries: {
    warriorId: string; warriorName: string; isHero: boolean
    currentXp: number; xpGained: number; advancementsTaken: number
  }[]
  wyrdstoneShards: number
  treasuryBefore: number
}

export default function PostBattlePage() {
  const { id: battleId } = useParams<{ id: string }>()
  const router = useRouter()
  const { init, battleId: storedBattleId, submitted } = usePostBattle()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (submitted) {
      router.push('/')
      return
    }

    // If we already have this battle loaded in the store, don't re-init
    if (storedBattleId === battleId) {
      setLoading(false)
      return
    }

    // Load battle data
    fetch(`/api/battles/${battleId}/post-battle-init`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load battle data')
        return r.json()
      })
      .then((data: BattleData) => {
        init(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [battleId, storedBattleId, init, submitted, router])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-md bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-destructive text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-cinzel text-2xl font-bold text-foreground">Post-Battle Sequence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Follow each step to resolve your battle consequences.
        </p>
      </div>
      <PostBattleWizard />
    </div>
  )
}
