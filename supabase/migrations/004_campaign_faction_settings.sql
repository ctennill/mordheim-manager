-- ============================================================
-- Mordheim Manager — Campaign Faction Settings
-- Migration: 004_campaign_faction_settings
-- Adds faction availability controls to campaigns
-- ============================================================

-- Nullable array: null = all factions allowed, populated = restricted list
alter table campaigns add column if not exists allowed_faction_ids uuid[];

-- Per-faction slot limits (e.g. "Max 2 Undead warbands per campaign")
create table if not exists campaign_faction_slots (
  campaign_id   uuid not null references campaigns(id) on delete cascade,
  faction_id    uuid not null references factions(id) on delete cascade,
  max_slots     integer not null default 1,
  primary key (campaign_id, faction_id)
);

alter table campaign_faction_slots enable row level security;

create policy "Faction slots visible to campaign participants"
  on campaign_faction_slots for select using (
    campaign_id in (
      select id from campaigns where privacy = 'public'
        or commissioner_id = auth.uid()
    )
    or campaign_id in (
      select campaign_id from campaign_players where player_id = auth.uid()
    )
  );

create policy "Commissioner manages faction slots"
  on campaign_faction_slots for all using (
    campaign_id in (select id from campaigns where commissioner_id = auth.uid())
  );

create index if not exists idx_campaign_faction_slots_campaign on campaign_faction_slots(campaign_id);
