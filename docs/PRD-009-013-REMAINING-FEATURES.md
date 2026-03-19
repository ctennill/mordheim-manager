# PRD-009: Statistics & Analytics Dashboard
**Version:** 1.0  
**Priority:** P1  
**Status:** Draft

---

## 1. Overview

Inspired by tourplay.net's global tracking statistics panel, the Analytics Dashboard gives commissioners and players insight into campaign trends, performance patterns, and historical data. This is a "power user" feature for groups that enjoy meta-analysis of their campaigns.

---

## 2. Key Features

### 2.1 Commissioner Analytics

**Campaign Health Panel:**
- Active players (logged in this week / this month)
- Battles scheduled vs. played (session completion rate)
- Average Warband Rating across all warbands (trend over sessions)
- WR gap: difference between highest and lowest WR (rising gap = snowball risk)
- Gold inequality: treasury distribution chart

**Battle Analytics:**
- Win rate by faction (bar chart)
- Average game length by scenario
- OOA rate per battle (casualties per game trending up/down)
- Most lethal scenario (highest average OOA)
- Rout percentage by faction (who gets routed most often)

**Progression Analytics:**
- Average XP per warrior per session
- Skill distribution across the campaign (which skills are most chosen)
- Injury frequency (which injury results come up most)
- Warband Rating growth curves per warband (divergence view)

### 2.2 Player Analytics

**My Campaign Stats:**
- Win rate over time (session-by-session trend)
- OOA caused vs. suffered (ratio)
- Wyrdstone collected per battle (trend)
- Gold earned vs. gold spent (net income trend)
- Warrior survival rate

**Faction Comparison:**
- How my faction performs vs. the campaign average
- Faction matchup matrix (wins/losses vs. each faction)

---

## 3. Export

All charts and tables exportable as:
- PNG (chart image)
- CSV (raw data)
- PDF report (formatted, branded with campaign name)

---

## 4. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Dashboard render time | < 3 seconds |
| Data freshness | Updates within 60 seconds of result submission |
| Chart library | Recharts or Chart.js (client-side) |

---

---

# PRD-010: Notifications & Communication
**Version:** 1.0  
**Priority:** P1  
**Status:** Draft

---

## 1. Overview

Players should never miss an important campaign event. Notifications keep everyone informed and reduce the commissioner's overhead for reminders.

Inspired by tourplay.net's push notification system and Discord integration.

---

## 2. Notification Events

| Event | Recipients | Channels |
|---|---|---|
| Battle pairing assigned | Both players | Email + In-app |
| Opponent submitted result (needs confirmation) | Confirming player | Email + In-app |
| Result confirmed | Both players | In-app |
| Post-battle sequence available | Warband owner | Email + In-app |
| Post-battle sequence due in 24h | Warband owner | Email |
| New campaign announcement | All campaign players | Email + In-app |
| Warrior killed (permanent) | Warband owner | In-app (solemn tone) |
| Warrior promoted (Lad's Got Talent) | Warband owner | In-app (celebration) |
| New session opened | All players | Email + In-app |
| Session deadline approaching | Players with pending results | Email |
| Territory challenged | Territory holder | Email + In-app |
| Captured warrior resolution needed | Captor and prisoner's owner | Email + In-app |

---

## 3. Channel Details

### 3.1 In-App Notifications
- Bell icon with badge count in navigation
- Notification center: list of unread and recent notifications
- Tap to navigate directly to relevant action

### 3.2 Email Notifications
- Transactional emails (result, confirmed, etc.): HTML template, branded
- Digest option: "Send me one daily email with all pending actions" (instead of individual)
- Unsubscribe from email (keeps in-app notifications)

### 3.3 Discord Integration (Phase 2)
- Campaign can link a Discord webhook
- Commissioner configures which events post to Discord
- Format: Embed message with warband icons, result summary, campaign link
- Example: "⚔️ **Battle Result** — Da Butcher's Basin Bruisers (ScourgeTXD) defeated Ratspawn Syndicate (VerminhoodX) in *Wyrdstone Hunt*. Session 4 standings updated."

---

## 4. Commissioner Announcements

- Rich text announcement panel in campaign management
- Announcements appear in:
  - Campaign news feed (all players)
  - Email digest (if enabled)
  - Discord (if configured)
- Scheduled announcements: write now, publish at a future date/time

---

## 5. Out of Scope (v1.0)
- Discord bot (slash commands, interactive)
- SMS notifications
- WhatsApp or Teams integration

---

---

# PRD-011: Data Export & Printing
**Version:** 1.0  
**Priority:** P2  
**Status:** Draft

---

## 1. Overview

Players and commissioners need to get their data out of the app — for physical use at the table, for archiving, or for integration with other tools. Inspired by tourplay.net's export features.

---

## 2. Export Types

### 2.1 Warband Roster Sheet (Print)
- Single-page PDF designed for table use
- Styled as a classic Mordheim roster card
- Contains: warband name, faction, all warriors with current stats, skills, equipment, XP, injuries, and treasury balance
- Two formats: Compact (all warriors on one sheet) / Detailed (one warrior per page section)
- Print-ready: black & white optimized, correct margins for standard paper

### 2.2 Campaign Export (Commissioner)
- Full campaign data export as ZIP containing:
  - `warbands.csv` — all warbands, ratings, records
  - `warriors.csv` — all warriors, stats, skills, injuries
  - `battles.csv` — all battle results
  - `territories.csv` — territory holdings
  - `standings.json` — current standings
- Useful for backup, external analysis, or migration

### 2.3 Individual Battle Report (PDF)
- After a battle is confirmed, generate a printable/shareable battle report
- Contains: date, scenario, combatants, result, warrior casualties, XP earned

### 2.4 Campaign Archive
- When a campaign is closed, a permanent archive snapshot is created
- Archive is read-only, publicly viewable (if campaign was public)
- Shareable link: `mordheimmanager.app/campaigns/[slug]/archive`

---

## 3. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Roster PDF generation | < 5 seconds |
| Campaign ZIP export | < 30 seconds for 10-warband campaign |
| Print layout | Tested on A4 and US Letter |

---

---

# PRD-012: Admin / Commissioner Tools
**Version:** 1.0  
**Priority:** P2  
**Status:** Draft

---

## 1. Overview

Commissioners need a robust set of tools to manage edge cases, resolve disputes, and maintain campaign integrity. This PRD covers the commissioner-specific administrative features.

---

## 2. Features

### 2.1 Campaign Settings (Post-Launch Edits)
- Commissioner can edit most campaign settings after launch (exceptions: ruleset version and faction availability once battles have been played)
- Change log visible to all players when settings are modified

### 2.2 Manual Overrides
| Action | When Used |
|---|---|
| Edit any warrior's stats | Correcting entry error |
| Edit any warband's treasury | Award/deduct gold for scenario |
| Force-complete any post-battle step | Player unavailable |
| Override a battle result | Disputed result resolution |
| Delete a battle result | Game was cancelled, not played |
| Award/revoke territory | Manual territory management |
| Mark warrior dead | If player cannot complete sequence |
| Advance session manually | All results in, move forward |

All overrides logged with: timestamp, commissioner username, action, reason (optional text field).

### 2.3 Dispute Resolution
- Disputes flag in the commissioner dashboard
- Commissioner sees both players' submitted versions side-by-side
- Commissioner makes ruling with notes
- Both players notified of resolution

### 2.4 Commissioner Notes
- Private notes per warband, visible only to commissioner
- Private notes per player (for conduct tracking, house rule reminders, etc.)
- Campaign notes (private journal for commissioner use)

### 2.5 Multiple Commissioners
- Commissioner can invite co-commissioners
- Co-commissioners have identical permissions
- Audit log identifies which commissioner performed each action

### 2.6 Warband Handicapping (Optional)
- For campaigns where WR gap becomes large:
  - Provide extra starting gold to struggling warbands (commissioner-set)
  - Allow catch-up XP (struggling warbands earn +1 XP per battle)
  - Announce handicap adjustments publicly or privately

---

---

# PRD-013: House Rules & Customization Engine
**Version:** 1.0  
**Priority:** P2  
**Status:** Draft

---

## 1. Overview

Every Mordheim group plays slightly differently. The customization engine lets commissioners build on the official rules without leaving the app — and lets advanced users eventually contribute custom factions and scenarios to a community library.

---

## 2. Features

### 2.1 Campaign-Level Rule Toggles

Pre-built toggles for commonly varied rules:

| Toggle | Default | Effect |
|---|---|---|
| "All warbands can hire any Hired Sword" | Off | Removes faction restrictions on Hired Swords |
| "Henchmen earn double XP" | Off | Speeds up henchman advancement |
| "Critical hits use expanded table" | Off | More lethal game |
| "Rally rule: autopass rout at > 50% models" | Off | Less snowball effect |
| "Campaign XP floors: minimum WR per session" | Off | Prevents extreme WR gap |
| "Exploration: Heroes can reroll once" | Off | Mitigates bad luck |
| "Dead warriors can be 'Last Rites'd for +1 XP" | Off | Narrative flavour option |
| "Rout consequences: routing warband loses D3 gc" | Off | Incentivizes fighting to the end |

### 2.2 Custom Experience Tables

Commissioner can modify XP award values:
- Override any standard XP event value (e.g., change "OOA enemy" from +1 to +2)
- Add custom XP events with name and description

### 2.3 Custom Scenarios

Commissioner can add scenarios:
- Scenario name and description
- Victory conditions (structured: primary / secondary)
- Special rules (free text)
- XP bonuses (adds to standard)
- Whether the scenario awards a territory

Custom scenarios appear in the scenario assignment pool alongside official ones.

### 2.4 Custom Factions (Advanced)

Phase 2 feature — allows commissioner to build a custom faction:
- Define position types (Hero / Henchmen)
- Set stat lines per position
- Set cost, min/max per warband
- Define skill list access
- Define equipment availability
- Set faction special rules (free text with structured effect fields)

Custom factions are private to the campaign unless published to the community library.

### 2.5 Community Library (Phase 2)
- Published custom factions and scenarios shared across the platform
- Rating system (upvote) to surface quality community content
- Commissioner browses and imports community content into their campaign

---

## 3. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Rule toggle changes | Apply immediately; retroactive effects noted |
| Custom faction validation | App checks for required fields before enabling |
| Community library | Moderated; Anthropic/admin review before publication |

---
