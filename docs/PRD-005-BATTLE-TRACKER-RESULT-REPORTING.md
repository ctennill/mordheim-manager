# PRD-005: Battle Tracker & Result Reporting
**Version:** 1.0  
**Priority:** P0  
**Status:** Draft

---

## 1. Overview

The Battle Tracker is the in-game companion tool and the post-game result entry system. It is inspired by tourplay.net's match tracker, which guides coaches through result entry step-by-step and supports real-time match following.

For Mordheim, a battle result is considerably more complex than a Blood Bowl match result. It includes: scenario outcome, warriors taken Out of Action (OOA), Wyrdstone collected, who routed, casualties by warrior, and any scenario-specific objectives.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| BT01 | Player | Open the battle tracker for my current pairing | I have a guided tool at the table |
| BT02 | Player | See the scenario description and special rules in-app | I don't need the rulebook |
| BT03 | Player | Log warriors that went Out of Action as the game happens | Results are accurate and not forgotten |
| BT04 | Player | Record when my warband routed | The correct result is logged |
| BT05 | Player | Record Wyrdstone shards collected | Income calculation is accurate |
| BT06 | Player | Record scenario objectives completed | Scoring reflects the full game |
| BT07 | Player | Submit my result at the end of the game | The commissioner sees it immediately |
| BT08 | Opponent | Confirm or dispute a submitted result | Results are mutually agreed |
| BT09 | Commissioner | See live battle status for all pairings | I know how sessions are progressing |
| BT10 | Commissioner | Manually enter or correct a result | Edge cases are handled |
| BT11 | Player | Schedule my battle date/time with my opponent | We coordinate without commissioner involvement |

---

## 3. Functional Requirements

### 3.1 Pre-Battle View

Before a battle begins, both players see a **Pairing Card** showing:
- Opponent's warband name, faction, and Warband Rating
- Opponent's player name and avatar
- Assigned scenario name (with link to full scenario rules)
- Relative WR comparison (visual bar showing who has the higher rating)
- Optional: "Scout Report" — opponent's last 3 results
- "Start Battle Tracker" button
- "Schedule Battle" button (if not yet scheduled)

### 3.2 Battle Scheduling

Inspired by tourplay.net's calendar scheduling tool:
- Player A proposes a date and time (and optionally a location/platform)
- Player B receives notification and can: Accept / Propose Alternative / Accept with note
- Agreed time appears in the campaign calendar
- Commissioner sees all scheduled battles in a calendar view
- If battle deadline passes without result: Commissioner is notified, can grant extension or force result entry

### 3.3 In-Battle Tracker (Optional Live Mode)

The live tracker is optional — players can use it at the table or just submit results afterward.

**Live Tracker UI:**
- Round counter (tap to advance: Round 1 → 2 → 3 → 4 → 5 → 6+)
- For each warband: 
  - Model list with Out of Action toggle per model
  - "Rout check failed" button (triggers automatic cascade — remaining models flee)
  - Wyrdstone counter (+ / - buttons)
- Scenario objective checkboxes (custom per scenario)
- Notes field (free text)
- "End Battle" button

**Turn Timer (optional):**
- Per-player turn timer inspired by tourplay.net's timer feature
- Start/pause per player
- Tracks total time for each side
- Not used for enforcement — informational only

### 3.4 Post-Battle Result Entry Form

The result entry form walks players through a structured sequence. Both players can fill this out independently; the system reconciles.

**Section 1: Battle Outcome**
- Who won? (My warband / Opponent's warband / Draw)
- How did the battle end?
  - [ ] Opponent's warband routed
  - [ ] My warband routed
  - [ ] Scenario objective completed (specify)
  - [ ] Mutual agreement / draw
  - [ ] Time ran out (partial game)

**Section 2: Scenario Specific**
- Dynamic fields based on scenario type:
  - Wyrdstone Hunt: Wyrdstone collected by each side
  - Hidden Treasure: Who found the treasure?
  - Occupy: Number of buildings controlled at end
  - Assassination: Was the target killed?
  - (etc., per scenario)

**Section 3: Casualties**
For each warrior in my warband, select post-battle status:
| Warrior | Type | Status |
|---|---|---|
| Franz the Scarred | Leader | Survived |
| Karl | Champion | Out of Action |
| Bruno | Youngblood | Out of Action |
| Swordsmen (3) | Henchmen | 2 Survived, 1 Out of Action |

- Out of Action triggers Serious Injury roll (see PRD-006)

**Section 4: Experience Summary**
- Pre-populated from the casualties and objectives data
- Player can adjust if a warrior earned XP in a non-standard way
- Each warrior's XP gain shown

**Section 5: Review & Submit**
- Summary of all entered data
- "Submit Result" button — sends to opponent for confirmation
- Confirmation: opponent sees summary, can "Confirm" or "Dispute"
- Dispute triggers commissioner notification

### 3.5 Result Confirmation Flow

```
Player A submits result
  → Opponent (Player B) notified
    → B confirms: result locked, post-battle sequence unlocks for both
    → B disputes: commissioner notified, game paused
      → Commissioner reviews, makes ruling, locks result
```

### 3.6 Result Reconciliation (Dual Submission)

If both players independently submit results:
- If results match: auto-confirm, no action needed
- If results conflict on winner: flag for commissioner
- If results conflict only on minor fields (Wyrdstone count ±1): show discrepancy, ask both players to agree
- Commissioner can always override

### 3.7 Commissioner Override

From the session management view, the commissioner can:
- Enter a result for any pairing
- Edit any submitted result (with audit log noting the change)
- Mark a result as "No Game Played" (both players receive 0 VP, no post-battle sequence)
- Mark a result as "Concede" (conceding player receives a loss, opposition receives a win)

---

## 4. Scenario Database

Each scenario in the database includes:
- Name
- Description (2–3 sentences)
- Special Rules (enumerated)
- Map setup guidance (text description)
- Objectives (structured data: type, condition, VP value)
- Wyrdstone placement rules
- Victory conditions
- Experience bonuses (scenario-specific, in addition to standard XP)

### Launch Scenarios:
1. Wyrdstone Hunt
2. Breakthrough
3. Street Fight
4. Occupy
5. Ambush!
6. Hidden Treasure
7. Defend the Find
8. The Gauntlet
9. Treasure Hunt
10. Attack and Defend
11. The Assassin
12. Chance Encounter
13. Skirmish (optional free-form)

---

## 5. XP Calculation (Auto-Generated from Result)

After result submission, XP is pre-calculated per warrior:

| Event | XP |
|---|---|
| Survived a battle (didn't rout, played whole game) | +1 |
| Caused at least one Out of Action | +1 |
| Caused 2+ Out of Actions | +1 additional (optional, campaign setting) |
| Enemy leader taken OOA (by this warrior) | +1 |
| Scenario objective contributed to | +1 |
| Warband won the battle (leader only) | +1 |

Players can adjust if the auto-calculation missed something, with a note field.

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Live tracker sync between two players | < 2 second refresh (polling) |
| Result entry form completion time | < 5 minutes for typical game |
| Dispute resolution SLA | Commissioner has 48h before auto-reminder |
| Results locked after | Commissioner closes session |

---

## 7. UI/UX Notes

- The result entry form is **mobile-first** — it will be used at the table
- Large tap targets for OOA toggles (min 44px)
- Warrior list shows faction-specific silhouette icons per type
- Progress indicator in form (Step 1 of 5)
- "Save progress and finish later" on every step
- Live tracker shows opponent's current OOA count (shared data) to help track mutual results

---

## 8. Out of Scope (v1.0)
- Photo upload (battle report with images — Phase 2)
- Integrated dice roller
- Battle map overlay / terrain tracker
- Video call integration

---
