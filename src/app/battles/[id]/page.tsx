import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { type Battle, type Warband } from '@/types/database'

export const metadata = { title: 'Battle — Mordheim Manager' }

const RESULT_LABEL: Record<string, string> = { win: 'Win', loss: 'Loss', draw: 'Draw' }
const RESULT_COLOR: Record<string, string> = {
  win: 'text-emerald-400 border-emerald-400/40',
  loss: 'text-red-400 border-red-400/40',
  draw: 'text-amber-400 border-amber-400/40',
}

type WarbandRow = Pick<Warband, 'id' | 'name' | 'owner_id' | 'treasury'>

export default async function BattlePage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: warbands } = await supabase
    .from('warbands')
    .select('id, name, owner_id, treasury')
    .in('id', [battle.warband_a_id, battle.warband_b_id]) as { data: WarbandRow[] | null }

  const warbandA = (warbands ?? []).find((w) => w.id === battle.warband_a_id)
  const warbandB = (warbands ?? []).find((w) => w.id === battle.warband_b_id)
  const myWarband = (warbands ?? []).find((w) => w.owner_id === user.id)
  const side: 'a' | 'b' | null = myWarband?.id === battle.warband_a_id ? 'a' : myWarband?.id === battle.warband_b_id ? 'b' : null

  const resultSubmitted = !!battle.submitted_by
  const resultConfirmed = !!battle.confirmed_by || battle.commissioner_override

  const myPostBattleDone = side === 'a' ? battle.post_battle_complete_a : side === 'b' ? battle.post_battle_complete_b : false
  const canEnterResult = side !== null && !resultSubmitted
  const canConfirm = side !== null && resultSubmitted && battle.submitted_by !== user.id && !resultConfirmed
  const canStartPostBattle = side !== null && resultConfirmed && !myPostBattleDone

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="font-cinzel text-2xl font-bold text-foreground">Battle</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {battle.played_at ? new Date(battle.played_at).toLocaleDateString() : 'Date not set'}
        </p>
      </div>

      {/* Warbands matchup */}
      <div className="grid grid-cols-3 items-center gap-4">
        <WarbandCard
          warband={warbandA}
          result={battle.result_a ?? null}
          routed={battle.warband_a_routed}
          wyrdstone={battle.wyrdstone_a}
          postBattleDone={battle.post_battle_complete_a}
          isMe={side === 'a'}
        />
        <div className="text-center">
          <div className="text-3xl font-bold text-muted-foreground/30">VS</div>
          <div className="mt-2 space-y-1">
            {!resultSubmitted && <p className="text-xs text-amber-400">Awaiting result</p>}
            {resultSubmitted && !resultConfirmed && <p className="text-xs text-amber-400">Awaiting confirmation</p>}
            {resultConfirmed && <p className="text-xs text-emerald-400">Result confirmed</p>}
          </div>
        </div>
        <WarbandCard
          warband={warbandB}
          result={battle.result_b ?? null}
          routed={battle.warband_b_routed}
          wyrdstone={battle.wyrdstone_b}
          postBattleDone={battle.post_battle_complete_b}
          isMe={side === 'b'}
        />
      </div>

      {/* Actions */}
      {side !== null && (
        <div className="space-y-3">
          {canEnterResult && (
            <Link
              href={`/battles/${battleId}/result`}
              className="flex items-center justify-between w-full rounded border border-gold/40 bg-gold/5 px-5 py-4 hover:bg-gold/10 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">Enter Battle Result</p>
                <p className="text-xs text-muted-foreground mt-0.5">Record outcome, casualties, and wyrdstone</p>
              </div>
              <span className="text-gold text-xl">→</span>
            </Link>
          )}

          {canConfirm && (
            <ConfirmButtons battleId={battleId} />
          )}

          {canStartPostBattle && (
            <Link
              href={`/battles/${battleId}/post-battle`}
              className="flex items-center justify-between w-full rounded border border-gold/40 bg-gold/5 px-5 py-4 hover:bg-gold/10 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">Post-Battle Sequence</p>
                <p className="text-xs text-muted-foreground mt-0.5">Resolve injuries, exploration, XP, and spending</p>
              </div>
              <span className="text-gold text-xl">→</span>
            </Link>
          )}

          {myPostBattleDone && (
            <div className="rounded border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
              Your post-battle sequence is complete.
            </div>
          )}
        </div>
      )}

      {battle.notes && (
        <div className="rounded-md border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Notes</p>
          <p className="text-sm text-foreground">{battle.notes}</p>
        </div>
      )}

      {/* Download battle report — only available once result is confirmed */}
      {resultConfirmed && (
        <div className="flex justify-end">
          <a
            href={`/api/battles/${battleId}/report`}
            className="text-xs border border-border rounded px-3 py-1.5 text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors"
          >
            Download Battle Report PDF
          </a>
        </div>
      )}
    </div>
  )
}

function WarbandCard({
  warband, result, routed, wyrdstone, postBattleDone, isMe,
}: {
  warband: WarbandRow | undefined
  result: string | null
  routed: boolean
  wyrdstone: number
  postBattleDone: boolean
  isMe: boolean
}) {
  return (
    <div className={`rounded-md border p-4 text-center space-y-2 ${isMe ? 'border-gold/30 bg-gold/5' : 'border-border bg-card'}`}>
      <p className="font-semibold text-foreground text-sm truncate">{warband?.name ?? '—'}</p>
      {isMe && <p className="text-xs text-gold/70">You</p>}
      {result && (
        <span className={`inline-block text-xs px-2 py-0.5 rounded border ${RESULT_COLOR[result] ?? 'text-muted-foreground border-border'}`}>
          {RESULT_LABEL[result] ?? result}
        </span>
      )}
      {wyrdstone > 0 && (
        <p className="text-xs text-muted-foreground">{wyrdstone} wyrdstone</p>
      )}
      {routed && <p className="text-xs text-amber-400/70">Routed</p>}
      {postBattleDone && <p className="text-xs text-emerald-400/70">Post-battle ✓</p>}
    </div>
  )
}

function ConfirmButtons({ battleId }: { battleId: string }) {
  return (
    <div className="rounded-md border border-amber-400/20 bg-amber-400/5 px-5 py-4 space-y-3">
      <p className="text-sm font-medium text-foreground">Confirm Battle Result</p>
      <p className="text-xs text-muted-foreground">Your opponent has submitted the result. Do you agree?</p>
      <div className="flex gap-2">
        <form action={`/api/battles/${battleId}/confirm`} method="POST">
          <input type="hidden" name="action" value="confirm" />
          <button type="submit" className="px-4 py-1.5 text-sm rounded border border-emerald-500/40 text-emerald-400 hover:bg-emerald-400/10 transition-colors">
            Confirm
          </button>
        </form>
        <form action={`/api/battles/${battleId}/confirm`} method="POST">
          <input type="hidden" name="action" value="dispute" />
          <button type="submit" className="px-4 py-1.5 text-sm rounded border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors">
            Dispute
          </button>
        </form>
      </div>
    </div>
  )
}
