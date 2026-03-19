import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/lib/supabase/server"
import { type Campaign } from '@/types/database'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    name, mode, location, privacy, description,
    ruleset, startingGold, startingXpBonus, maxWarbandSize, maxWarbands,
    hiredSwordsEnabled, dramatisPersonaeEnabled, magicItemsSetting, alignmentRulesEnabled,
    allowedFactionIds, factionSlots,
    totalSessions, pairingMethod,
    pointsWin, pointsDraw, pointsLoss,
  } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })
  }

  // Generate a unique slug
  const baseSlug = slugify(name)
  const suffix = Math.random().toString(36).slice(2, 6)
  const slug = `${baseSlug}-${suffix}`

  const insert = {
    commissioner_id: user.id,
    name: name.trim(),
    slug,
    mode: mode ?? 'standard',
    status: 'draft',
    privacy: privacy ?? 'public',
    description: description?.trim() || null,
    location: location?.trim() || null,
    ruleset: ruleset ?? 'core',
    starting_gold: startingGold ?? 500,
    starting_xp_bonus: startingXpBonus ?? 0,
    max_warband_size: maxWarbandSize ?? 15,
    max_warbands: maxWarbands ?? 12,
    hired_swords_enabled: hiredSwordsEnabled ?? true,
    dramatis_personae_enabled: dramatisPersonaeEnabled ?? true,
    magic_items_setting: magicItemsSetting ?? 'core',
    alignment_rules_enabled: alignmentRulesEnabled ?? false,
    allowed_faction_ids: allowedFactionIds ?? null,
    total_sessions: totalSessions ?? null,
    pairing_method: pairingMethod ?? 'commissioner',
    current_session: 0,
    points_win: pointsWin ?? 3,
    points_draw: pointsDraw ?? 1,
    points_loss: pointsLoss ?? 0,
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert(insert as never)
    .select('id')
    .single() as { data: Pick<Campaign, 'id'> | null; error: unknown }

  if (error || !campaign) {
    console.error('Campaign insert error:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }

  // Insert faction slot overrides if any
  const slotEntries = Object.entries(factionSlots ?? {}).filter(([, n]) => Number(n) > 0)
  if (slotEntries.length > 0) {
    const slotRows = slotEntries.map(([factionId, maxSlots]) => ({
      campaign_id: campaign.id,
      faction_id: factionId,
      max_slots: Number(maxSlots),
    }))
    await supabase.from('campaign_faction_slots').insert(slotRows as never)
  }

  return NextResponse.json({ id: campaign.id }, { status: 201 })
}
