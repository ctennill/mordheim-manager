# PRD-002: Warband Builder
**Version:** 1.0  
**Priority:** P0  
**Status:** Draft

---

## 1. Overview

The Warband Builder is the core creation tool of Mordheim Manager. It is analogous to the team-building system on tourplay.net, which displays faction rosters, position allowances, costs, and skill categories for all available team types.

In Mordheim, warband building is more complex than Blood Bowl team creation because:
- Each faction has a mix of **Heroes** (named individuals with unique advancement paths) and **Henchmen** (groups of identical models that advance together)
- Equipment and weapons are purchased separately from warriors
- Starting gold is fixed (500 gold crowns) and every purchase matters
- The initial roster must satisfy faction minimum/maximum rules before a campaign begins

The builder guides players through this process with validation at every step.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| WB01 | Player | Browse all available warband factions | I can choose the right faction for me |
| WB02 | Player | See each faction's special rules and flavor text | I understand the playstyle before committing |
| WB03 | Player | Select a faction and start building a roster | My warband creation is guided |
| WB04 | Player | See live gold crown cost as I add warriors | I don't accidentally overspend |
| WB05 | Player | Purchase equipment for each warrior individually | My loadout is tracked per model |
| WB06 | Player | See clear errors if my roster violates rules | I can't accidentally submit an illegal warband |
| WB07 | Commissioner | Restrict faction availability per campaign | Supplements can be enabled/disabled |
| WB08 | Player | Save a draft warband before submitting to campaign | I can come back and finish later |
| WB09 | Player | Print or export my warband roster | I have a physical reference at the table |

---

## 3. Functional Requirements

### 3.1 Faction Browser
A browsable, filterable catalog of all supported factions showing:
- Faction name and icon/illustration
- Type tag: Official / Supplement / Custom
- Brief special rules summary (1–3 bullet points)
- Ruleset tag: Core / Town Cryer / Community Edition
- Link to full faction detail view

#### Faction Detail View
Each faction page shows (mirroring tourplay.net's team detail pages):
- Faction lore / flavor paragraph
- Starting gold (500 gc standard)
- Special rules (enumerated)
- Maximum warband size (typically 3–15 models)
- Full roster table:

| Position | Type | M | WS | BS | S | T | W | I | A | Ld | Special Rules | Cost |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Leader | Hero | 4 | 4 | 4 | 3 | 3 | 1 | 4 | 1 | 8 | — | 40 gc |
| Champion | Hero (0–2) | 4 | 4 | 3 | 3 | 3 | 1 | 4 | 1 | 7 | — | 35 gc |
| Youngblood | Hero (0–2) | 4 | 2 | 2 | 3 | 3 | 1 | 3 | 1 | 6 | — | 15 gc |
| Swordsmen | Henchmen (0–5) | 4 | 3 | 3 | 3 | 3 | 1 | 3 | 1 | 7 | — | 25 gc |
| Marksmen | Henchmen (0–5) | 4 | 3 | 3 | 3 | 3 | 1 | 3 | 1 | 7 | — | 25 gc |
| Beggars | Henchmen (0–3) | 4 | 2 | 2 | 3 | 3 | 1 | 3 | 1 | 6 | — | 15 gc |

- Equipment availability table (what weapons/armor this faction can purchase)
- Hired Swords available to this faction
- Dramatis Personae (special named NPCs) available

### 3.2 Warband Creation Wizard

**Step 1: Choose Faction**
- Display faction cards with icons
- Campaign may restrict available factions

**Step 2: Name Your Warband**
- Warband name (required, unique within campaign)
- Optional: warband motto / background notes

**Step 3: Hire Your Heroes**
- Must hire the Leader (mandatory, 1 only)
- Optionally hire available Hero types within their max limits
- Each hero shows: name field, profile stats, cost, and equipment slots
- Gold counter updates live

**Step 4: Hire Your Henchmen**
- Add henchman groups (each group = same type, same equipment)
- Choose henchman type, set count
- Must maintain minimum warband size of 3 models
- Gold counter updates live

**Step 5: Equip Your Warriors**
- For each Hero and Henchman group: open equipment panel
- Equipment panel shows items available to this faction with costs
- Enforce equipment rules (max 2 hand weapons, max one of each armor type, etc.)
- Common items available to all; faction-specific items flagged

**Step 6: Review & Submit**
- Full roster summary with gold breakdown
- Validation checklist:
  - ✅ Leader hired
  - ✅ Minimum 3 models
  - ✅ Maximum warband size not exceeded
  - ✅ No hero type over its maximum
  - ✅ Gold spent ≤ 500 gc (or campaign-set starting gold)
  - ✅ No illegal equipment combinations
- "Save Draft" or "Submit to Campaign"

### 3.3 Equipment Database

Each item in the equipment database includes:
- Name
- Category: Hand Weapon / Two-Handed Weapon / Missile Weapon / Armor / Miscellaneous
- Cost (gc)
- Profile modifiers (e.g., Sword: +0, Halberd: +1S, -1I in some editions)
- Special rules (e.g., Axe: ignores shield save)
- Availability: which factions can purchase this item
- Rarity rating (some items require Availability rolls)

### 3.4 Gold Crown Tracker
- Real-time display of gold spent vs. gold remaining
- Breakdown panel: heroes cost | henchmen cost | equipment cost | total
- Warning state (yellow) when < 10 gc remaining
- Error state (red) when gold is overspent

### 3.5 Warband Rating (WR) Calculation
Warband Rating is calculated automatically and displayed:

```
WR = (sum of all warrior experience points) + (5 × number of warriors)
```

Additional modifiers per the official rules (e.g., gold in treasury / 5) shown as breakdown.

### 3.6 Draft Save / Load
- Warbands can be saved as drafts before submitting to a campaign
- Draft warbands not associated with a campaign don't count against campaign slots
- Draft warbands can be duplicated (useful for theorycrafting)

---

## 4. Validation Rules

| Rule | Type | Message |
|---|---|---|
| Must have exactly 1 Leader | Error | "You must hire a Leader to lead your warband." |
| Minimum 3 models | Error | "Your warband must have at least 3 models to enter Mordheim." |
| Maximum 15 models (standard) | Error | "Your warband cannot exceed 15 models." |
| Faction hero max exceeded | Error | "[Position] can only have [max] per warband." |
| Gold overspent | Error | "You have exceeded your starting gold allowance." |
| No ranged weapon + no close combat weapon | Warning | "[Warrior] has no weapons and will fight unarmed." |

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Equipment database load time | < 500ms |
| Live gold calculation response | < 100ms (client-side) |
| Faction catalog page | Supports 50+ factions without pagination |

---

## 6. UI/UX Notes

- **Faction cards** use faction-specific color palette and iconography
- **Equipment selection** uses a modal/drawer pattern — player selects warrior, equipment panel slides in
- **Stats display** uses a horizontal stat block matching Mordheim table format
- **Mobile:** wizard collapses into a bottom-sheet stepper
- **Print view:** generates a clean roster sheet in the style of classic Mordheim roster cards

---

## 7. Out of Scope (v1.0)
- Custom faction creator (PRD-013)
- Magic items (added post-campaign, not at creation)
- Hired Sword builder (available during campaign, not creation)

---
