# PRD-004: Campaign Manager
**Version:** 1.0  
**Priority:** P0  
**Status:** Draft

---

## 1. Overview

The Campaign Manager is the core organizational hub — the commissioner's control room and the player's campaign home base. It maps closely to tourplay.net's League Manager, but with Mordheim's unique structure: campaigns are **persistent**, **non-elimination** (warbands that struggle don't drop out, they get poorer and weaker), and **narrative** (scenarios, territories, and events create story moments).

A campaign runs across multiple **sessions**, each session containing one round of battles between paired warbands.

---

## 2. Campaign Modes

| Mode | Description | Typical Use |
|---|---|---|
| **Standard Campaign** | 2–8 players, scheduled sessions, paired battles, full campaign rules | Home group or game store league |
| **Open Campaign** | Players join/leave freely, battles are logged as-played, no forced pairings | Ongoing club ladder |
| **Event Campaign** | Fixed number of sessions, all battles in a single weekend, condensed rules | Convention or event play |
| **Solo / Practice** | Single player runs a warband through the campaign solo | Learning the rules, narrative play |

---

## 3. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| CM01 | Commissioner | Create a new campaign with a name, mode, and rules settings | Players can register and join |
| CM02 | Commissioner | Set which factions are allowed in the campaign | I can control supplement usage |
| CM03 | Commissioner | Set starting gold, warband size limits, and house rules flags | My group's preferences are reflected |
| CM04 | Commissioner | Invite players via shareable link or email | Onboarding is frictionless |
| CM05 | Commissioner | Approve or reject warband submissions | I can verify legal rosters before the campaign starts |
| CM06 | Commissioner | Start the campaign when all warbands are ready | The first session begins cleanly |
| CM07 | Commissioner | Generate pairings for a session | Each session has clear match assignments |
| CM08 | Commissioner | Assign scenarios to each pairing | The correct scenario is played |
| CM09 | Commissioner | Close a session after all results are in | Session results are locked and archived |
| CM010 | Commissioner | Announce the winner and close the campaign | Campaign history is preserved |
| CM011 | Player | See my pairing for the current session | I know who I'm playing and what scenario |
| CM012 | Player | See the campaign standing at any time | I understand my position |
| CM013 | Player | Submit my battle result | The commissioner doesn't need to manually enter it |
| CM014 | Player | Access the campaign's house rules and notes | I understand the local rules |

---

## 4. Functional Requirements

### 4.1 Campaign Creation

**Step 1: Basic Settings**
- Campaign Name (required)
- Campaign Mode (Standard / Open / Event / Solo)
- Location (City, Country, or "Online")
- Game Store affiliation (optional, from store directory)
- Privacy: Public (visible in campaign browser) / Private (invite only) / Unlisted (link only)
- Campaign description / background text (rich text, optional)
- Campaign logo / banner image (upload, optional)

**Step 2: Rules Configuration**
- Ruleset: Core Mordheim 2019 / Town Cryer Compilation / Community Edition / Custom
- Starting Gold: default 500 gc (configurable 300–750 gc)
- Starting XP bonus: none / +2 / +5 (optional for catch-up mechanics)
- Max warband size: default 15 (configurable)
- Supplement packs enabled (multi-select):
  - Official Supplements (Relics of the Crusade, etc.)
  - Town Cryer Additions
  - Community Edition additions
  - Custom (commissioner-uploaded)
- Hired Swords: Enabled / Disabled
- Dramatis Personae: Enabled / Disabled
- Magic Items: Core only / All / Disabled
- Alignment rules (Law/Neutral/Chaos): Enabled / Disabled

**Step 3: Faction Availability**
- Multi-select checklist of all factions
- "Allow all official factions" toggle
- "Allow supplement factions" toggle
- Per-faction slot limits (e.g., "Max 2 Undead warbands")

**Step 4: Session Structure**
- Number of sessions (0 = open-ended)
- Session frequency: Weekly / Bi-weekly / Monthly / Flexible
- Pairing method: Commissioner-assigned / Swiss / Round Robin / Random
- Battle result deadline (hours after session opens)

**Step 5: Scoring**
- Victory Point system:
  - Win: 3 pts / Draw: 1 pt / Loss: 0 pts (standard)
  - Custom VP values (configurable)
- Tiebreaker hierarchy (configurable): Victory Points → WR → Head-to-head → Battles played

---

### 4.2 Campaign Dashboard (Commissioner View)

The commissioner dashboard shows:

**Status Panel**
- Campaign status: Draft / Registration Open / Active / Closed / Archived
- Current session number
- Registered warbands: X / max
- Warbands with pending actions (post-battle to complete, results to submit)

**Warband Registry**
| Warband | Player | Faction | WR | Status | Actions |
|---|---|---|---|---|---|
| Da Butcher's Basin Bruisers | ScourgeTXD | Orc | 127 | Active | View / Edit |
| Sisters of the Iron Gate | CelestineK | Sisters | 98 | Active | View |
| Ratspawn Syndicate | VerminhoodX | Skaven | 142 | Active | View |

**Session Control Panel**
- Current session: Session 4 of 8
- Pairings list with status (Result submitted / Awaiting result / In progress)
- "Generate Pairings" button
- "Close Session" button (requires all results submitted or manually overridden)
- Override: Commissioner can manually enter or edit any result

**Announcements Panel**
- Rich-text announcement editor
- Published to campaign news feed
- Players receive notification

---

### 4.3 Campaign Dashboard (Player View)

**My Warband Summary**
- Warband name, faction icon, Warband Rating
- My record: W/L/D
- Treasury balance
- Next session pairing: "vs. [Opponent] — [Scenario Name]"

**Campaign News Feed**
- Commissioner announcements
- Recent battle results (all pairings)
- "X warband achieved [milestone]" notifications

**Session Schedule**
- Calendar view or list view of sessions with dates
- Match scheduling: player can propose date/time, opponent confirms (like tourplay.net's scheduling tool)

---

### 4.4 Pairing System

**Round Robin**
- All warbands play each other exactly once
- Automatic scheduling across N sessions
- Handles byes if odd number

**Swiss Pairings**
- Standard Swiss: pair highest vs second-highest in standings
- Avoid re-matches where possible
- Commissioner can manually override

**Random Pairings**
- Randomized each session
- Option: weight random pairings against warbands not yet faced

**Commissioner-Assigned**
- Commissioner manually selects pairings each session
- Option to import from a spreadsheet

---

### 4.5 Scenario Assignment

Each pairing is assigned a scenario. Methods:
1. **Commissioner assigns** — manually selects from scenario list
2. **Random roll** — app rolls on the scenario table (per rulebook), players can see result
3. **Player choice** — higher WR player picks, or mutual agreement
4. **Scenario pool** — commissioner defines a pool; pairings draw from pool without repeats

**Scenario Database (included at launch):**
- Wyrdstone Hunt
- Breakthrough
- Street Fight
- Occupy
- Ambush!
- Hidden Treasure
- Defend the Find
- The Gauntlet
- Treasure Hunt
- Attack and Defend
- The Assassin
- Chance Encounter

Each scenario entry includes: name, special rules summary, attacker/defender determination, ending conditions.

---

### 4.6 Campaign Registration Flow

1. Commissioner creates campaign and shares link
2. Player clicks link → creates account (if needed) → creates warband
3. Warband submitted to campaign for approval
4. Commissioner reviews roster (validation already run by app) → Approve / Request Changes
5. Player notified of approval
6. Campaign starts when commissioner clicks "Start Campaign"

---

## 5. Campaign States

```
[Draft] 
  → Commissioner configuring settings
[Registration Open] 
  → Players joining and submitting warbands
[Active - Session N] 
  → Battles being played, results being submitted
[Session Closed] 
  → All results in, post-battle sequences complete
  → Moves to next session
[Campaign Complete] 
  → Final session closed, winner announced
[Archived] 
  → Read-only, permanent record
```

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Max warbands per campaign | 20 |
| Max concurrent active campaigns (per commissioner) | 5 |
| Campaign dashboard load time | < 1.5 seconds |
| Pairing generation | < 3 seconds for 20 warbands |

---

## 7. UI/UX Notes

- Campaign landing page is **public** (if not private) — shareable URL for recruiting players
- Commissioner dashboard has a distinctive top-bar indicator showing campaign status
- Pairing card shows: player avatars, warband names, faction icons, assigned scenario
- "Pending action" badges on nav items (e.g., "Post-Battle (3)" indicating 3 warbands need attention)
- Session timeline shown as a progress bar with clickable session nodes

---

## 8. Out of Scope (v1.0)
- Multiple divisions within one campaign
- Relegation / promotion between divisions
- Automated Discord integration for pairings announcements (PRD-010)
- Campaign "Acts" or narrative chapters (Phase 2 feature)

---
