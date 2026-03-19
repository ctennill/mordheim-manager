# PRD-008: Campaign Standings & Rankings
**Version:** 1.0  
**Priority:** P1  
**Status:** Draft

---

## 1. Overview

Standings give players a clear view of who's winning the campaign and where they stand. Unlike a simple leaderboard, Mordheim campaign standings need to capture the nuances of the game: raw wins matter, but so does Warband Rating growth, territory control, and warrior achievements.

This PRD is inspired by tourplay.net's rankings and standings system, which offers live-updated leaderboards with flexible scoring and tiebreaking and top-player statistics.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| S01 | Player | See the campaign standings at any time | I know where my warband ranks |
| S02 | Player | See my personal stats: W/L/D, WR history, OOA dealt | I can track my performance |
| S03 | Player | See a leaderboard of top warriors | I know who the most feared fighters are |
| S04 | Player | See a history of all results in the campaign | I can follow the narrative |
| S05 | Commissioner | Configure what metrics are used for standings | The scoring fits my group's preferences |
| S06 | Commissioner | See a global view of campaign health | I can spot if warbands are falling too far behind |

---

## 3. Campaign Standings Table

The main standings table shows all warbands sorted by the primary scoring metric:

| Rank | Warband | Player | Faction | GP | W | D | L | VP | WR | Territories |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Da Butcher's Basin Bruisers | ScourgeTXD | Orc | 5 | 4 | 0 | 1 | 12 | 187 | 4 |
| 2 | Sisters of the Iron Gate | CelestineK | Sisters | 5 | 3 | 1 | 1 | 10 | 156 | 2 |
| 3 | Ratspawn Syndicate | VerminhoodX | Skaven | 5 | 3 | 0 | 2 | 9 | 143 | 3 |

**Columns (configurable by commissioner):**
- GP: Games Played
- W/D/L: Win / Draw / Loss
- VP: Victory Points (configurable: Win=3/Draw=1/Loss=0, or custom)
- WR: Current Warband Rating
- WR Δ: Change in WR from start of campaign
- Territories: Number of territories held
- Gold: Current treasury (optional, some commissioners hide this)

**Tiebreakers (configurable, applied in order):**
1. VP
2. WR (higher WR wins tiebreak)
3. Head-to-head result
4. Most OOA caused
5. Fewest OOA suffered

---

## 4. Warband Detail Stats

Clicking into a warband from the standings shows their full campaign stat page:

**Battle Record:**
- GP / W / D / L
- VP total and percentage
- Win streak / longest win streak

**Warband Rating History:**
- Line chart showing WR over the course of the campaign session by session
- Starting WR vs. current WR

**Territory History:**
- Territories gained, lost, and currently held

**Warriors Of Note:**
- Most experienced warrior (highest XP)
- Most kills (most OOA caused)
- Most injured warrior
- Any warrior with a notable achievement badge

---

## 5. Top Warriors Leaderboard

A campaign-wide leaderboard of individual warriors, not warbands:

| Rank | Warrior | Type | Warband | XP | OOA Caused | Skills |
|---|---|---|---|---|---|---|
| 1 | Franz the Scarred | Leader | Da Butcher's... | 38 | 12 | 7 |
| 2 | Shiv-Sister Agatha | Champion | Sisters of... | 29 | 9 | 5 |

Filterable by:
- Warrior type (Hero only / Henchmen / All)
- Faction
- XP / OOA / Skills

---

## 6. Battle Results Log

A full chronological log of all confirmed battle results in the campaign:

| Session | Warband A | Result | Warband B | Scenario | Date |
|---|---|---|---|---|---|
| Session 4 | Da Butcher's (ScourgeTXD) | **W** 3–0 | Ratspawn (VerminhoodX) | Wyrdstone Hunt | Mar 14 |
| Session 4 | Sisters (CelestineK) | D 1–1 | Witch Hunters (HammerK) | Street Fight | Mar 15 |

Clicking a result row expands the battle report showing:
- OOA suffered by each side
- Wyrdstone collected
- Scenario objectives
- Notable events (warrior deaths, promotions)

---

## 7. Campaign Summary Stats

An aggregate stats panel for the whole campaign:

- Total battles played: N
- Total warriors killed: N (permanent deaths)
- Total warriors promoted (Henchman → Hero): N
- Most common injury: [X]
- Most popular faction: [X]
- Gold spent across all warbands: N gc
- Most Wyrdstone collected in a single battle: N (by [warband])
- Highest single-session WR gain: +N (by [warband])

---

## 8. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Standings page load | < 1 second |
| Standings refresh after result submission | < 30 seconds (near real-time) |
| Battle log pagination | 20 results per page |
| Export (CSV / PDF) | Available for all tables |

---

## 9. UI/UX Notes

- Standings use faction-colored row accents (each faction has a palette color)
- Player's own warband is always highlighted in the standings table
- WR history chart shows all warbands on the same chart with faction colors (toggle individual warbands)
- "As of Session N" label on all standings so context is clear
- Mobile: standings collapse to rank / warband name / VP / WR only (swipe to see more)

---

## 10. Out of Scope (v1.0)
- Global cross-campaign rankings (site-wide leaderboard)
- Elo / MMR-style rating system
- Streamer/spectator mode for campaign results

---
