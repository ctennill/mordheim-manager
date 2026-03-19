-- ============================================================
-- Mordheim Manager — Territory Income Formulas
-- Migration: 005_territory_income_formula
-- Adds income_formula column and updates territory records
-- ============================================================

alter table territories add column if not exists income_formula text not null default 'none';

-- Update existing territories with proper dice formulas
update territories set income_formula = 'none'       where name = 'Ruined Hovels';
update territories set income_formula = '2D6*5'      where name = 'Alchemist''s Laboratory';
update territories set income_formula = 'none'       where name = 'Shrine';
update territories set income_formula = 'D6*5'       where name = 'Marketplace';
update territories set income_formula = 'D6*5'       where name = 'Warpstone Cache';
update territories set income_formula = 'D6*5'       where name = 'Settlement';
update territories set income_formula = 'none'       where name = 'Graveyard';
update territories set income_formula = 'D6*5'       where name = 'Tavern';
update territories set income_formula = 'none'       where name = 'Smithy';
update territories set income_formula = 'none'       where name = 'Sorcerer''s Mansion';
update territories set income_formula = 'D6*5'       where name = 'Storehouse';
update territories set income_formula = 'none'       where name = 'Library';
update territories set income_formula = 'none'       where name = 'Watchtower';
update territories set income_formula = 'none'       where name = 'Execution Ground';

-- Add commissioner-award policy on warband_territories
create policy if not exists "Commissioner can manage territories in their campaign"
  on warband_territories for all using (
    campaign_id in (select id from campaigns where commissioner_id = auth.uid())
  );
