import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { WarbandRosterPdf } from '@/lib/pdf/warband-roster'
import { type Warband, type Warrior, type Faction } from '@/types/database'
import React from 'react'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [warbandRes, warriorsRes] = await Promise.all([
    supabase.from('warbands').select('*, factions(*)').eq('id', id).single(),
    supabase
      .from('warriors')
      .select('*, warrior_equipment(*, equipment(name))')
      .eq('warband_id', id)
      .neq('status', 'dead')
      .order('warrior_type')
      .order('created_at'),
  ])

  const warband = warbandRes.data as (Warband & { factions: Faction | null }) | null
  if (!warband) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Auth: must be owner or campaign commissioner
  if (warband.owner_id !== user.id) {
    // Allow campaign commissioners
    if (warband.campaign_id) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('commissioner_id')
        .eq('id', warband.campaign_id)
        .single() as { data: { commissioner_id: string } | null }
      if (!campaign || campaign.commissioner_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const warriors = (warriorsRes.data ?? []) as (Warrior & {
    warrior_equipment: { equipment: { name: string } | null }[]
  })[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await renderToStream(React.createElement(WarbandRosterPdf, { warband, warriors }) as any)

  const filename = `${warband.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-roster.pdf`

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
