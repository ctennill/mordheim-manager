-- ============================================================
-- Mordheim Manager — Row Level Security Policies
-- Migration: 002_row_level_security
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────────────────────

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- ── Factions / Positions / Equipment (read-only game data) ───────────────────

alter table factions enable row level security;
create policy "Factions are public"
  on factions for select using (true);

alter table faction_positions enable row level security;
create policy "Faction positions are public"
  on faction_positions for select using (true);

alter table equipment enable row level security;
create policy "Equipment is public"
  on equipment for select using (true);

alter table faction_equipment enable row level security;
create policy "Faction equipment is public"
  on faction_equipment for select using (true);

alter table scenarios enable row level security;
create policy "Scenarios are public"
  on scenarios for select using (true);

alter table territories enable row level security;
create policy "Territories are public"
  on territories for select using (true);

-- ── Warbands ─────────────────────────────────────────────────────────────────

alter table warbands enable row level security;

-- Public campaigns: anyone can view approved/active warbands
create policy "Public warband visibility"
  on warbands for select using (
    owner_id = auth.uid()
    or campaign_id in (
      select id from campaigns where privacy = 'public'
    )
  );

create policy "Owners can insert their own warbands"
  on warbands for insert with check (owner_id = auth.uid());

create policy "Owners can update their own warbands"
  on warbands for update using (owner_id = auth.uid());

create policy "Owners can delete draft warbands"
  on warbands for delete using (owner_id = auth.uid() and status = 'draft');

-- ── Warriors ─────────────────────────────────────────────────────────────────

alter table warriors enable row level security;

create policy "Warriors viewable by warband owner or campaign participants"
  on warriors for select using (
    warband_id in (
      select id from warbands where owner_id = auth.uid()
    )
    or warband_id in (
      select w.id from warbands w
      join campaign_players cp on cp.warband_id = w.id
      join campaigns c on c.id = cp.campaign_id
      where c.privacy = 'public' or cp.player_id = auth.uid()
    )
  );

create policy "Warband owners can manage their warriors"
  on warriors for all using (
    warband_id in (select id from warbands where owner_id = auth.uid())
  );

-- ── Warrior Equipment / Injuries / Advances ──────────────────────────────────

alter table warrior_equipment enable row level security;
create policy "Warband owners manage warrior equipment"
  on warrior_equipment for all using (
    warrior_id in (
      select w.id from warriors w
      join warbands wb on wb.id = w.warband_id
      where wb.owner_id = auth.uid()
    )
  );

alter table warrior_injuries enable row level security;
create policy "Warband owners manage warrior injuries"
  on warrior_injuries for all using (
    warrior_id in (
      select w.id from warriors w
      join warbands wb on wb.id = w.warband_id
      where wb.owner_id = auth.uid()
    )
  );

alter table warrior_advances enable row level security;
create policy "Warband owners manage warrior advances"
  on warrior_advances for all using (
    warrior_id in (
      select w.id from warriors w
      join warbands wb on wb.id = w.warband_id
      where wb.owner_id = auth.uid()
    )
  );

-- ── Campaigns ────────────────────────────────────────────────────────────────

alter table campaigns enable row level security;

create policy "Public campaigns are visible to everyone"
  on campaigns for select using (
    privacy = 'public'
    or commissioner_id = auth.uid()
    or id in (
      select campaign_id from campaign_players where player_id = auth.uid()
    )
  );

create policy "Any authenticated user can create campaigns"
  on campaigns for insert with check (
    auth.uid() is not null and commissioner_id = auth.uid()
  );

create policy "Commissioner can update their campaigns"
  on campaigns for update using (commissioner_id = auth.uid());

-- ── Campaign Players ─────────────────────────────────────────────────────────

alter table campaign_players enable row level security;

create policy "Campaign participants are visible to other participants and commissioner"
  on campaign_players for select using (
    player_id = auth.uid()
    or campaign_id in (
      select id from campaigns where commissioner_id = auth.uid()
    )
    or campaign_id in (
      select campaign_id from campaign_players where player_id = auth.uid()
    )
  );

create policy "Players can join campaigns"
  on campaign_players for insert with check (player_id = auth.uid());

create policy "Commissioner can update campaign player records"
  on campaign_players for update using (
    campaign_id in (select id from campaigns where commissioner_id = auth.uid())
  );

-- ── Sessions ─────────────────────────────────────────────────────────────────

alter table sessions enable row level security;

create policy "Sessions visible to campaign participants"
  on sessions for select using (
    campaign_id in (
      select campaign_id from campaign_players where player_id = auth.uid()
    )
    or campaign_id in (
      select id from campaigns where commissioner_id = auth.uid()
    )
    or campaign_id in (
      select id from campaigns where privacy = 'public'
    )
  );

create policy "Commissioner manages sessions"
  on sessions for all using (
    campaign_id in (select id from campaigns where commissioner_id = auth.uid())
  );

-- ── Battles ──────────────────────────────────────────────────────────────────

alter table battles enable row level security;

create policy "Battles visible to campaign participants"
  on battles for select using (
    campaign_id in (
      select campaign_id from campaign_players where player_id = auth.uid()
    )
    or campaign_id in (
      select id from campaigns where commissioner_id = auth.uid()
    )
    or campaign_id in (
      select id from campaigns where privacy = 'public'
    )
  );

create policy "Participants can submit and update their battle results"
  on battles for update using (
    warband_a_id in (select id from warbands where owner_id = auth.uid())
    or warband_b_id in (select id from warbands where owner_id = auth.uid())
    or campaign_id in (select id from campaigns where commissioner_id = auth.uid())
  );

create policy "Commissioner can insert battles"
  on battles for insert with check (
    campaign_id in (select id from campaigns where commissioner_id = auth.uid())
  );

alter table battle_warrior_results enable row level security;

create policy "Battle warrior results visible to participants"
  on battle_warrior_results for select using (
    battle_id in (
      select b.id from battles b
      join campaign_players cp on cp.campaign_id = b.campaign_id
      where cp.player_id = auth.uid()
    )
  );

create policy "Warband owners manage their warrior results"
  on battle_warrior_results for all using (
    warband_id in (select id from warbands where owner_id = auth.uid())
  );

-- ── Warband Territories ───────────────────────────────────────────────────────

alter table warband_territories enable row level security;

create policy "Territory holdings visible to campaign participants"
  on warband_territories for select using (
    warband_id in (select id from warbands where owner_id = auth.uid())
    or campaign_id in (
      select campaign_id from campaign_players where player_id = auth.uid()
    )
    or campaign_id in (
      select id from campaigns where privacy = 'public'
    )
  );

create policy "Warband owners manage their territories"
  on warband_territories for all using (
    warband_id in (select id from warbands where owner_id = auth.uid())
  );

-- ── Role grants (required for PostgREST / anon access) ────────────────────────

grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
