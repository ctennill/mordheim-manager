# PRD-003: Warrior & Hero Management
**Version:** 1.0  
**Priority:** P0  
**Status:** Draft

---

## 1. Overview

Warriors are the beating heart of Mordheim. Unlike Blood Bowl where players have fixed stat lines and advance slowly, Mordheim warriors accumulate experience rapidly, develop unique skill combinations, suffer permanent injuries, and occasionally die. This makes individual warrior tracking the most data-intensive part of the application.

This PRD covers the ongoing lifecycle of every warrior in a warband: stat tracking, experience gain, advancement rolls, injury recording, equipment management, and eventual retirement or death.

---

## 2. Warrior Types

### Heroes
- Named individual models with unique names
- Have their own Experience Point (XP) total
- Roll on Hero advancement tables when reaching XP thresholds
- Can receive Individual skills (from their faction's skill lists)
- When slain: permanent death (removed from warband), triggers "Leader Dead" special rules if leader
- Max: defined per position per faction (e.g., 1 Leader, 2 Champions, 2 Youngbloods)

### Henchmen (Groups)
- Tracked as a group — all models in a group share the same stats, skills, and equipment
- XP is tracked per group (not per model)
- When a group reaches an advancement threshold, roll once — all models in the group benefit
- Henchmen can **promote to Hero** status if they roll "Lad's Got Talent" on the advancement table
- When a henchman model is killed, reduce group count by 1 (no individual name tracking, unless promoted)

---

## 3. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| W01 | Player | Name each of my Heroes | My warband has personality and narrative |
| W02 | Player | See each warrior's current stats, skills, and equipment | I have a complete profile per warrior |
| W03 | Player | Record experience earned after each battle | XP tracks automatically with results |
| W04 | Player | Roll advancements when a warrior hits an XP threshold | I'm guided through the correct table |
| W05 | Player | Record the result of an advancement roll | The stat increase or skill is applied to the warrior |
| W06 | Player | Record an injury from the Serious Injury table | The injury's effect is tracked permanently |
| W07 | Player | Mark a warrior as dead | The warrior is removed from active duty with cause of death noted |
| W08 | Player | Promote a henchman to Hero status | The individual model is split from the group with a new name |
| W09 | Player | Buy new equipment for a warrior mid-campaign | Their loadout is updated and cost deducted from treasury |
| W10 | Player | Sell equipment back (at half cost) | I can free up gold and re-equip |
| W11 | Player | Track a warrior's "Lad's Got Talent" promotion | Henchman splits from group, becomes a new Hero entry |
| W12 | Commissioner | View all warriors across all warbands in the campaign | I have visibility for disputes and records |

---

## 4. Warrior Profile

### 4.1 Hero Profile Card
Each Hero has a detailed profile showing:

**Identity**
- Name (player-assigned, editable)
- Type (Leader / Champion / Youngblood / etc.)
- Faction
- Status: Active / Recovering / Dead / Retired

**Characteristics (current, after all modifiers)**
| Stat | Base | Modifiers | Current |
|---|---|---|---|
| M | 4 | — | 4 |
| WS | 4 | +1 advance | 5 |
| BS | 4 | — | 4 |
| S | 3 | — | 3 |
| T | 3 | — | 3 |
| W | 1 | — | 1 |
| I | 4 | -1 injury (leg) | 3 |
| A | 1 | — | 1 |
| Ld | 8 | — | 8 |

- Stat cap indicators (most stats cap at 6, special cases noted)
- Visual indicator when a stat is at maximum

**Experience**
- Total XP earned (all-time)
- XP at last advancement threshold
- XP to next advancement (thresholds: 2, 4, 6, 8, 11, 14, 17, 20, 24, 28, 32+)
- XP history log (battle-by-battle)

**Skills & Abilities**
- List of all acquired skills
- Source of each: "Roll #3 (vs Undead, 2026-01-15)" or "Lad's Got Talent promotion"
- Special abilities from faction rules

**Equipment (current loadout)**
- Slot-based display: Main Hand, Off Hand, Armor, Helmet, Shield, Miscellaneous ×3
- Each slot shows: item name, weight (if relevant), special rules
- "Manage Equipment" button

**Injuries (permanent)**
- List of permanent injuries recorded
- Injury name, effect, date acquired
- "Exploring" limitations if applicable

**Battle History**
- Paginated log: date, opponent, result (Survived / Out of Action / Captured / Killed)
- XP earned per battle

---

### 4.2 Henchman Group Profile Card
Each henchman group shows:

**Identity**
- Group label (e.g., "Swordsmen #1")
- Type
- Current count (e.g., "3 models")

**Characteristics (shared by all models in group)**
- Same stat block as Hero

**Experience**
- Group XP total
- Next advancement threshold
- Advancement history

**Equipment**
- All models in the group share the same equipment

**Casualties Log**
- Models killed or captured (reduces group count)
- "Remove model" action

---

## 5. Experience System

### 5.1 XP Thresholds (Heroes)
| XP Earned | Advancements Gained |
|---|---|
| 2 | 1st Advance |
| 4 | 2nd Advance |
| 6 | 3rd Advance |
| 8 | 4th Advance |
| 11 | 5th Advance |
| 14 | 6th Advance |
| 17 | 7th Advance |
| 20 | 8th Advance |
| 24 | 9th Advance |
| 28 | 10th Advance |
| 32+ | +4 XP per subsequent advance |

### 5.2 XP Thresholds (Henchmen)
| XP Earned | Advancements Gained |
|---|---|
| 4 | 1st Advance |
| 8 | 2nd Advance |
| 12 | 3rd Advance |
| +4 | Each subsequent advance |

### 5.3 XP Earning Events (auto-populated from battle results)
- Surviving a battle: +1 XP
- Causing an Out of Action: +1 XP per enemy OOA'd
- Killing an enemy: +1 XP
- Being the player who caused the enemy to rout: +1 XP (leader only)
- Scoring an objective: +1 XP (scenario-dependent)

### 5.4 Advancement Roll System
When a warrior hits a threshold, the player is prompted in the app to roll advancements.

**Heroes:** Roll 2D6 on the Hero Advancement Table:

| 2D6 | Result |
|---|---|
| 2 | Roll twice on this table, re-rolling further 2s |
| 3–4 | New Skill (choose from primary or secondary skill list) |
| 5 | +1 Initiative |
| 6 | +1 Wound or +1 Attack |
| 7 | +1 Strength or +1 Toughness |
| 8 | +1 WS or +1 BS |
| 9 | +1 Initiative |
| 10 | +1 Leadership |
| 11 | New Skill |
| 12 | Lad's Got Talent (Heroes: re-roll; Henchmen: promote to Hero!) |

- App displays the table, player enters their roll result
- App applies the correct stat change or prompts skill selection
- When a stat is maxed, app automatically redirects to skill roll

---

## 6. Injury System

### 6.1 Serious Injury Table (D66)
When a warrior goes Out of Action, after the battle they roll on the Serious Injury table. The app guides the player through this roll:

| D66 | Injury | Effect |
|---|---|---|
| 11–15 | Lightly Wounded | No lasting effect |
| 16 | Deep Wound | Miss next battle |
| 21 | Bitter Enmity | Gains Hatred against a random enemy warband |
| 22 | Captured | Held prisoner by enemy (see Capture rules) |
| 23 | Hardened | Immune to Fear |
| 24 | Robbery | Loses all equipment |
| 25 | Sold to the Pits | Possible death, chance of escape |
| 26 | Worsening Old Battle Wound | -1 to Toughness |
| 31 | Captured | (same as 22) |
| 32 | Amnesia | Loses one skill |
| 33 | Bone Splinter | -1 BS, permanent |
| 34 | Smashed Leg | -1 M, permanent |
| 35 | Chest Wound | -1 T, permanent |
| 36 | Blinded in One Eye | -1 BS, permanent |
| 41 | Deep Wound | Miss next battle |
| 42–43 | Full Recovery | No effect |
| 44 | Nervous Condition | -1 I, permanent |
| 45 | Hand Injury | -1 WS, permanent |
| 46 | Multiple Injuries | Roll D6 times on this table |
| 51–52 | Head Wound | -1 Initiative, +1 Leadership |
| 53–54 | Robbed | Loses D6×5 gc from treasury |
| 55 | Crushing Blow | -1 Attack |
| 56 | Severe Head Wound | -1 Ld, permanent |
| 61–65 | Dead | Remove from warband |
| 66 | Totally Recovered | No effect |

The app:
1. Presents the D66 roll interface (roll two D6, combine as tens/units)
2. Displays the result and its mechanical effect
3. Offers to apply the effect automatically
4. For "Dead" results, prompts confirmation before permanently removing the warrior
5. For "Captured" results, triggers the capture sub-system

### 6.2 Capture System
- Captured warriors are flagged as "Prisoner"
- At campaign start of next session, holding player can: Ransom, Execute, or Sell to Pits
- Captured warrior's owner can attempt Rescue scenario (commissioner enables this)
- Auto-resolved at campaign milestone if not resolved within N sessions

---

## 7. Equipment Management (In-Campaign)

### 7.1 Treasury Integration
- Each warband has a gold crown treasury (see PRD-007)
- Equipment purchases deduct from treasury
- Selling equipment returns 50% of purchase cost
- "Black Market" items may have Availability rolls (D6 roll, fails if < item's rarity)

### 7.2 Magic Items
- Can be found during Exploration (PRD-006) or purchased from Merchant scenarios
- Magic items are unique entries with special rules text
- Stored in warband's "vault" until equipped

---

## 8. Warrior Lifecycle States

```
[Created] → [Active] → [Out of Action*] → [Recovered]
                    ↘ [Captured] → [Ransomed] → [Active]
                    ↘ [Serious Injury] → [Missing Next Battle] → [Active]
                    ↘ [Dead] (terminal)
                    ↘ [Sold to Pits] → [escaped] → [Active]
                                     → [Dead] (terminal)
[Active] → [Promoted to Hero] (Henchman only)
[Active] → [Retired] (player choice, narrative only)
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Warrior profile page load | < 1 second |
| Advancement roll UI | Interactive, guided — no separate page load required |
| Injury table roll | Must be guided with result auto-applied |
| Max warriors per warband | 20 (accounts for hired swords) |
| Battle log history | Retain all-time, paginated at 10 per page |

---

## 10. UI/UX Notes

- Hero cards use portrait orientation with stat block on the right and a silhouette/illustration area on the left (faction-specific placeholder if no custom image)
- "Pending Roll" indicator on dashboard when a warrior has an outstanding advancement
- Color coding: Active = green border, Recovering = amber, Dead = dark/grey, Captured = purple
- XP bar shows progress to next threshold visually
- Stat changes from injuries shown in **red** (negative) or **green** (positive) in the stat block

---

## 11. Out of Scope (v1.0)
- Custom warrior artwork upload
- 3D model integration
- Animosity / jealousy tracking between specific warriors (narrative flavor, optional)

---
