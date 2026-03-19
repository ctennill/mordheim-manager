# PRD-006: Post-Battle Sequence Automation
**Version:** 1.0  
**Priority:** P0  
**Status:** Draft

---

## 1. Overview

The Post-Battle Sequence is one of Mordheim's most distinctive and complex mechanics. After every battle, a warband must work through a multi-step process that involves: resolving injuries, collecting income, rolling for Wyrdstone sale prices, searching for equipment and magic items (Exploration), spending gold, and advancing warriors.

This process typically takes 20–40 minutes at the table even for experienced players. The application automates the logic, guides the player through the correct sequence, and prevents errors. This is one of the highest-value features of Mordheim Manager — it dramatically reduces administrative burden.

---

## 2. The Official Post-Battle Sequence (Order Matters)

The sequence must be followed in this order per the official rules:

1. **Serious Injuries** — Roll for all warriors who went Out of Action
2. **Captives** — Handle any captured warriors
3. **Rout Recovery** — Warbands that routed check for lasting effects (if applicable)
4. **Income** — Collect Wyrdstone income and other income sources
5. **Exploration** — Heroes roll to explore, finding equipment, encounters, or gold
6. **Experience** — Apply XP earned and roll any advancements that were triggered
7. **Spend Income** — Purchase new warriors, equipment, or services
8. **Update Roster** — Roster is now locked for next session

The app guides the player through each step in order, preventing them from skipping ahead.

---

## 3. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| PBS01 | Player | Be guided through the post-battle sequence step by step | I don't miss anything or do steps out of order |
| PBS02 | Player | Enter my Serious Injury dice rolls with the table visible | Injuries are applied correctly |
| PBS03 | Player | Calculate my Wyrdstone income automatically | I don't have to do the math |
| PBS04 | Player | Roll for exploration with dice roll prompts | Exploration results are tracked |
| PBS05 | Player | See the exploration result description | I know what I found |
| PBS06 | Player | Apply experience and advancement rolls | Warriors are updated without manual editing |
| PBS07 | Player | Spend my gold on new warriors and equipment | The treasury updates automatically |
| PBS08 | Player | Submit my completed post-battle sequence | Commissioner sees roster is ready for next session |
| PBS09 | Commissioner | See which warbands have completed their post-battle sequence | I know when a session is truly done |

---

## 4. Functional Requirements

### 4.1 Sequence Entry Point

Post-battle sequence becomes available after:
- Battle result is confirmed by both players (or commissioner-locked)
- Player navigates to their warband → "Post-Battle Sequence (Pending)" button

The sequence is locked to one completion per battle. Once submitted, it cannot be re-opened without commissioner override.

---

### 4.2 Step 1: Serious Injuries

For each warrior marked Out of Action in the battle result:

1. Show the warrior's name and type
2. Display D66 roll interface (roll D6 for tens, D6 for units)
3. Player enters their roll (or uses in-app roll simulator if no physical dice)
4. App looks up result on the Serious Injury table
5. Display result: name, description, and mechanical effect
6. Confirmation button: "Apply this result"
7. App applies the effect automatically:
   - Stat reduction → modifies warrior's current stat
   - "Miss next battle" → sets warrior status to "Recovering (1 battle)"
   - "Captured" → sets warrior status to "Prisoner," prompts ransom flow
   - "Dead" → confirmation modal, then removes warrior from active roster
   - "Sold to Pits" → D6 roll to determine escape or death
   - "Lightly Wounded / Full Recovery" → no effect, status stays Active

**Special case: Multiple Injuries (D66 = 46)**
- Roll D6 additional times on the table
- Apply all results sequentially
- If "Dead" appears in any sub-roll, warrior is dead regardless of other results

---

### 4.3 Step 2: Captives

For any warrior currently held Prisoner:
- **As the holding warband** (captor): presented with options:
  - Ransom: send demand to the prisoner's player (sets negotiation in motion)
  - Execute: warrior is killed, +D3 gc reward (varies by faction and campaign rules)
  - Sell to the Pits: warrior is removed, earn D6×5 gc (check vs. Rarity 9)
  - Free: release without condition (narrative)
- **As the prisoner's warband**: notified of captor's choice
  - If ransom demanded: see the amount, can accept (pay from treasury) or decline (warrior lost)

---

### 4.4 Step 3: Rout Recovery (if applicable)

Standard rules have no lasting effects for routing. Campaign-specific house rules may apply effects here. If campaign has "Rout Consequence" enabled:
- Warband that routed rolls D6; on a 1, a random warrior suffers a Serious Injury as if they went OOA.

---

### 4.5 Step 4: Income

**Wyrdstone Income**
Income is calculated based on Wyrdstone shards held:

| Wyrdstone Held | Base Income (gc) |
|---|---|
| 1 | 45 |
| 2 | 70 |
| 3 | 100 |
| 4 | 120 |
| 5 | 145 |
| 6+ | +20 per additional shard |

- App automatically calculates based on Wyrdstone recorded in the battle tracker
- Player can adjust if house rules or scenario modified collection

**Territory Income** (if PRD-007 is enabled)
- Each territory controlled contributes its income value
- App sums territory income and adds to total

**Other Income Sources**
- Well-guarded stash (from previous Exploration result)
- Scenario victory bonus (if any)
- Miscellaneous commissioner-awarded income

**Treasury Update**
- Display: Gold Before | Income This Battle | New Treasury Total
- Gold is added to treasury before Exploration spending

---

### 4.6 Step 5: Exploration

This is the most complex and most beloved part of the Mordheim post-battle sequence.

**Who Explores?**
- Only Heroes that survived (didn't rout, weren't OOA) explore
- Heroes that went OOA but survived their injury roll also explore (per standard rules, unless "injured" flag set)
- The player rolls once per eligible Hero

**Exploration Roll**
Each exploring Hero rolls 1D6 (some skills modify this). The warband's total Exploration roll is all their Hero dice combined, compared against the Exploration Table.

| Roll Total | Result |
|---|---|
| 1–5 | Nothing Found |
| 6 | Well (territory, if territory rules active) |
| 7 | Statue of Sigmar |
| 8 | Unusual Herbs |
| 9 | Hidden Tome |
| 10 | Dwarf Map |
| 11 | Shrine |
| 12 | Alchemist's Lab |
| 13 | Smithy |
| 14 | Gunsmith |
| 15 | Clothier |
| 16 | Carpenter |
| 17 | Garden of Morr |
| 18+ | Catacombs (roll D3 times on full table) |

For each result the app shows:
- Result name
- Description (flavor text + mechanical effect)
- Outcome: Gold found / Item found / Territory discovered / Special rule applied
- Items go to warband's vault for equipping in Step 7

**Exploration Skill Modifiers (auto-applied):**
- Excellent Scouting: +1 to each Hero's exploration die
- Streetwise: +1 to exploration total
- Haggle: reduces purchase costs by D6×5 gc

---

### 4.7 Step 6: Experience & Advancements

This step is partially automated from the battle result:

1. Show XP gains per warrior (from PRD-005 auto-calculation)
2. Player confirms or adjusts
3. Apply XP to each warrior
4. For each warrior now at or past a threshold:
   - Show "Advance available!" badge
   - Prompt advancement roll (see PRD-003 §5.4)
   - Apply result

**Skill Selection (when advancement roll = "New Skill"):**
1. Show faction-specific primary and secondary skill lists for this hero type
2. Player selects one skill
3. Skill added to warrior's profile

---

### 4.8 Step 7: Spend Income

With income and Exploration results processed, the player can now spend gold:

**Available Purchases:**
- Hire new warriors (opens wizard similar to initial warband creation)
- Purchase equipment for existing warriors (opens equipment panel)
- Purchase Hired Swords (if enabled)
- Purchase Dramatis Personae (if enabled and available)
- Stash gold (retain in treasury for future sessions)

**Hired Swords** (if campaign-enabled):
- Available Hired Swords appropriate to the faction
- Cost: hiring fee + upkeep per battle
- Hired Swords do not gain XP, do not advance, cannot be promoted
- Special rules per Hired Sword type

**Treasury Live Update:**
- As purchases are made, treasury decrements in real-time
- Warning if treasury goes below 0 (overspending not allowed)
- "Save & Continue" persists partial state

---

### 4.9 Step 8: Submit Completed Sequence

Final confirmation page showing:
- Summary of all changes made this post-battle:
  - Injuries applied to warriors
  - XP gained and advances rolled
  - Gold earned and spent
  - New warriors hired
  - New equipment purchased
- "Submit Roster Update" button
- Commissioner notified of completion
- Campaign dashboard shows "Post-Battle: Complete ✅" for this warband

---

## 5. State Management

Post-battle sequence state is saved incrementally. If a player closes the app mid-sequence:
- All completed steps are saved
- Player resumes from where they left off
- Each step is timestamped

**Step completion states:**
- `not_started` | `in_progress` | `complete` | `skipped` (commissioner override)

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Post-battle sequence total guided time | < 10 minutes (vs 30–40 manual) |
| State persistence (browser close) | All progress saved |
| Exploration table lookup | Instant (client-side) |
| Serious Injury table lookup | Instant (client-side) |

---

## 7. UI/UX Notes

- **Step indicator:** Persistent stepper at top (Step 3 of 8: Income)
- **Roll interface:** Large dice display with tap-to-set digit interface for D66 rolls
- **Injury results:** Color-coded severity: grey (nothing), amber (miss battle), red (stat loss), dark red (dead)
- **Exploration reveal:** Animated "reveal" for exploration results to add excitement
- **Summary page:** Printable post-battle summary (PDF export)

---

## 8. Out of Scope (v1.0)
- Animated dice rolling (cosmetic)
- Multiplayer-synchronized post-battle (each player does theirs independently)
- Advanced territory rules sub-system (PRD-007)

---
