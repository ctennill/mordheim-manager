# PRD-007: Territory & Income System
**Version:** 1.0  
**Priority:** P1  
**Status:** Draft

---

## 1. Overview

Territory is the persistent resource layer of a Mordheim campaign. Warbands claim territories through exploration, battle, and scenario outcomes. Each territory provides ongoing income and sometimes special rules. Managing territories — and potentially contesting them — adds a strategic layer to campaign play beyond simply winning battles.

This system is optional (commissioner can disable it) but is core to the full Mordheim experience.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| T01 | Player | See all territories my warband controls | I know my income sources |
| T02 | Player | See the territories all other warbands control | I understand the campaign map state |
| T03 | Player | Find a new territory through Exploration | My warband gains income |
| T04 | Player | Challenge an opponent for their territory (scenario) | I can grow my territory empire |
| T05 | Commissioner | View the territory map for the whole campaign | I manage the overall campaign state |
| T06 | Commissioner | Award or remove territories manually | I can handle edge cases |
| T07 | Commissioner | Enable/disable specific territories | I can customize the campaign |

---

## 3. Territory Database

Each territory has:
- Name
- Description (flavor text)
- Income value (gc per post-battle)
- Special rules (if any)
- Availability method: Exploration roll / Scenario reward / Commissioner award

### Standard Territories (from core rules):

| Territory | Income | Special Rules |
|---|---|---|
| Alchemist's Laboratory | 2D6×5 gc | Can sell Wyrdstone here at enhanced rate |
| Armourers | 2D6×5 gc | Buy armor at -25% cost |
| Assayer's Office | D6×5 gc | — |
| Blacksmith's Forge | D6×5 gc | Buy weapons at -D6×5 gc cost |
| Bsyicle Temple | 3D6×5 gc | — |
| Building (basic) | D6×5 gc | — |
| Carpenter's Workshop | D6×5 gc | — |
| Clothier's Shop | D6×5 gc | Buy clothing items at half price |
| Fallen Merchant | D6×5 gc + item | Find random Common item each session |
| Gunsmith's | D6×5 gc | Buy black powder weapons at -D6×5 gc |
| Hidden Treasure | One-time D6×10 gc | Consumed after first income roll |
| Jeweller's | 2D6×5 gc | — |
| Moneylender's House | 2D6×5 gc | May take loans (house rules) |
| Merchant's House | 2D6×5 gc | — |
| Shrine | D6 Prayers available | Roll on Prayer table each session |
| Slaughterhouse | D6×5 gc | — |
| Smith's Forge | D6×5 gc | Same as Blacksmith's |
| Tanner's Yard | D6×5 gc | Buy leather armor free |
| Townhouse | D6×5 gc | — |
| Watchtower | D6×5 gc | +1 to Exploration dice while held |
| Well | D6×5 gc | — |

---

## 4. Territory Acquisition

### 4.1 Through Exploration
- Certain Exploration table results yield territories (see PRD-006 §4.6)
- Territory added to warband's holdings immediately

### 4.2 Through Scenario Outcome
- Certain scenarios award a territory to the winner
- Commissioner sets this flag when assigning scenarios
- App automatically awards territory upon confirmed result

### 4.3 Territory Challenges
- A warband may challenge another warband for a specific territory they hold
- Challenger selects "Challenge for Territory" from the target warband's public profile
- Commissioner must approve and schedule the challenge battle
- Scenario assigned: "Attack and Defend" or commissioner's choice
- Winner claims the territory; loser loses it from their holdings

### 4.4 Commissioner Award
- Commissioner can manually grant or revoke any territory at any time
- Audit log records all manual territory changes

---

## 5. Territory Display

### 5.1 Warband Territory Panel
On each warband's profile page, a Territory section shows:
- All controlled territories (as cards with name, income, and special rules)
- Total territory income per session
- "Challenge" button on each territory (available to other players)

### 5.2 Campaign Territory Map
A simplified territory map for the campaign shows:
- All territories in the campaign (listed or shown on a stylized Mordheim city map)
- Color-coded by controlling warband
- Total territories per warband
- Uncontrolled territories (available through exploration or commissioner award)

### 5.3 Territory Income Calculation
During post-battle income step (PRD-006 §4.5):
- Each territory's income is rolled (or auto-rolled by the app)
- Income values with dice components (D6×5 gc) are prompted as dice rolls or auto-resolved
- Total territory income added to Wyrdstone income

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Territory panel load | < 500ms |
| Territory map render | < 2 seconds |
| Max territories per warband | 20 (effectively uncapped for gameplay) |

---

## 7. Out of Scope (v1.0)
- Animated territory map with hex grid
- Territory adjacency rules (contesting adjacent territories)
- Seasonal territory resets
- Territory trading between warbands (direct trade, not challenge)

---
