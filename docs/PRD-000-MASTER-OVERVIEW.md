# Mordheim Manager — Master PRD Overview
**Version:** 1.0  
**Date:** March 2026  
**Author:** Clint Tennill  
**Inspiration:** tourplay.net (Blood Bowl Tournament & League Manager)

---

## 1. Project Vision

**Mordheim Manager** is a web application for building, managing, and tracking Mordheim warbands across persistent campaign play. It is the Mordheim equivalent of tourplay.net — a tool that handles the administrative complexity of the game so players can focus on strategy and narrative.

The application serves two primary use modes:
- **Solo / Small Group:** A single commissioner running a home campaign with 2–8 players.
- **Club / Event:** A game store or club coordinator managing a public campaign or event with many players.

---

## 2. Core Design Philosophy

| Principle | Description |
|---|---|
| **Made by players, for players** | Every feature should reduce tabletop friction, not add new complexity |
| **Rules-accurate** | All calculations, advancement tables, injury tables, and income tables match the official Mordheim 2019 Town Cryer compilation rules |
| **Campaign-first** | Unlike tournament tools, the campaign persistent narrative is the star — territory, experience, and legacy matter |
| **Mobile-accessible** | Players should be able to log results from the table on a phone |
| **Extensible** | Support for official warbands, community supplements, and house rules |

---

## 3. PRD Document Map

| PRD # | Title | Priority |
|---|---|---|
| PRD-001 | User Accounts & Profiles | P0 |
| PRD-002 | Warband Builder | P0 |
| PRD-003 | Warrior / Hero Management | P0 |
| PRD-004 | Campaign Manager | P0 |
| PRD-005 | Battle Tracker & Result Reporting | P0 |
| PRD-006 | Post-Battle Sequence Automation | P0 |
| PRD-007 | Territory & Income System | P1 |
| PRD-008 | Campaign Standings & Rankings | P1 |
| PRD-009 | Statistics & Analytics Dashboard | P1 |
| PRD-010 | Notifications & Communication | P1 |
| PRD-011 | Data Export & Printing | P2 |
| PRD-012 | Admin / Commissioner Tools | P2 |
| PRD-013 | House Rules & Customization Engine | P2 |

---

## 4. Supported Warbands (Launch)

### Official GW Warbands
- Reiklanders
- Marienburg Merchants
- Middenheim Mercenaries
- Undead
- Skaven
- Sisters of Sigmar
- Witch Hunters
- Orcs & Goblins
- Cult of the Possessed
- Beastmen Raiders

### Supplemental Warbands (Phase 2)
- Dwarven Treasure Hunters
- Averlanders
- Ostlanders
- Kislevite Rangers
- Pirates of Sartosa
- Norse Warband
- Shadow Warriors
- Carnival of Chaos
- Possessed Warbands
- Restless Dead
- Clan Eshin Assassins
- Amazons

---

## 5. Technology Stack (Recommended for Claude Code)

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Node.js + Express (or Next.js full-stack) |
| Database | PostgreSQL (Supabase for quick start) |
| Auth | Supabase Auth or Auth0 |
| Hosting | Vercel (frontend) + Supabase (backend/DB) |
| State Management | Zustand or React Query |

---

## 6. Key Differences From tourplay.net

| tourplay.net Concept | Mordheim Manager Equivalent |
|---|---|
| Team | Warband |
| Coach | Player / Commissioner |
| Match | Battle |
| League | Campaign |
| Tournament | Event Campaign |
| Player (BB) | Warrior (Hero or Henchman) |
| Star Player | Hired Sword |
| Gold (team value) | Gold Crowns + Warband Rating |
| Season | Campaign Season / Act |
| Race | Warband Faction |
| Skills | Skills & Advances |
| Inducements | Hired Swords & Dramatis Personae |
| Rankings | Campaign Standings |

---

## 7. MVP Scope (v1.0)

The minimum viable product must include:
1. User registration and warband creation (PRD-001, PRD-002)
2. Warrior roster with stats, skills, and equipment (PRD-003)
3. Campaign creation with 2–12 players (PRD-004)
4. Battle result entry and validation (PRD-005)
5. Automated post-battle sequence (PRD-006)
6. Campaign standings page (PRD-008)

The following are explicitly out of scope for v1.0:
- Territory map visualization
- Mobile app (web must be mobile-responsive)
- Discord bot integration
- Real-time battle tracking

---
