import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BattleResultForm } from '@/components/battle/result-form'
import { type Battle, type Warband, type Warrior } from '@/types/database'

export const metadata = { title: 'Enter Battle Result — Mordheim Manager' }

export default async function BattleResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single() as { data: Battle | null }

  if (!battle) notFound()

  // Determine which side the current user is
  const { data: warbands } = await supabase
    .from('warbands')
    .select('id, name, owner_id')
    .in('id', [battle.warband_a_id, battle.warband_b_id]) as {
      data: Pick<Warband, 'id' | 'name' | 'owner_id'>[] | null
    }

  const myWarband = (warbands ?? []).find((w) => w.owner_id === user.id)
  if (!myWarband) {
    redirect(`/battles/${battleId}`) // viewer only
  }

  const side: 'a' | 'b' = myWarband.id === battle.warband_a_id ? 'a' : 'b'
  const opponentWarband = (warbands ?? []).find((w) => w.id !== myWarband.id)

  // Already submitted?
  if (battle.submitted_by) {
    redirect(`/battles/${battleId}`)
  }

  // Fetch my warriors
  const { data: warriors } = await supabase
    .from('warriors')
    .select('id, name, warrior_type, group_count, status')
    .eq('warband_id', myWarband.id)
    .not('status', 'eq', 'dead')
    .order('warrior_type')
    .order('created_at') as {
      data: Pick<Warrior, 'id' | 'name' | 'warrior_type' | 'group_count' | 'status'>[] | null
    }

  const casualtyWarriors = (warriors ?? []).map((w) => ({
    id: w.id,
    name: w.name ?? (w.warrior_type === 'hero' ? 'Hero' : 'Henchmen'),
    isHero: w.warrior_type === 'hero',
    groupCount: w.group_count,
    outOfActionCount: 0,
  }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-cinzel text-2xl font-bold text-foreground">Enter Battle Result</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record the outcome for your warband.
        </p>
      </div>
      <BattleResultForm
        battleId={battleId}
        myWarbandId={myWarband.id}
        myWarbandName={myWarband.name}
        opponentWarbandName={opponentWarband?.name ?? 'Opponent'}
        side={side}
        warriors={casualtyWarriors}
      />
    </div>
  )
}
