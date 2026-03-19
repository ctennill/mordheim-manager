# PRD-001: User Accounts & Profiles
**Version:** 1.0  
**Priority:** P0  
**Status:** Draft

---

## 1. Overview

Every person who uses Mordheim Manager needs an account. Accounts serve three roles that may overlap: **Player** (manages their own warband), **Commissioner** (runs a campaign), and **Admin** (site-level management). A single user may hold all three roles simultaneously.

This PRD is inspired by tourplay.net's coach profile system, which tracks global stats, competition history, and provides a persistent identity across leagues.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| U01 | Visitor | Register with email + password or SSO | I can start using the app quickly |
| U02 | Player | See my profile page with all my warbands listed | I have one place to manage everything |
| U03 | Player | See my campaign history | I can track my record over time |
| U04 | Player | Set a display name and upload an avatar | Other players recognize me |
| U05 | Player | Choose my region / game store | Local campaigns are easy to find |
| U06 | Commissioner | See all campaigns I manage from my dashboard | I have operational visibility |
| U07 | Commissioner | Invite players to my campaign by email or share link | Onboarding is frictionless |
| U08 | Player | Manage multiple warbands across multiple campaigns | I can participate in more than one campaign |

---

## 3. Functional Requirements

### 3.1 Registration & Authentication
- Email + password registration with email verification
- SSO via Google (Phase 1), Discord (Phase 2)
- Password reset via email
- Session persistence (remember me, 30-day token)

### 3.2 User Profile
Each user profile contains:

**Public fields:**
- Display name (unique handle, e.g. "ScourgeTXD")
- Avatar image (upload or Gravatar fallback)
- Region / city / country (optional, for local discovery)
- Preferred game store (optional, links to store profile)
- Bio / tagline (max 200 characters)
- Member since date
- Total battles played (all-time)
- Win / Loss / Draw record (all-time)

**Private fields (visible to self only):**
- Email address
- Notification preferences
- Linked social accounts

### 3.3 Player Dashboard
The dashboard is the homepage after login. It must show:
- Active warbands (with faction icon, campaign name, current rating)
- Campaigns with pending actions (post-battle sequences to complete, battles to schedule)
- Recent battle results (last 5)
- Upcoming scheduled battles
- Quick actions: "New Warband", "Find Campaign", "Create Campaign"

### 3.4 Warband Roster Overview
From profile, player sees a card for each warband showing:
- Warband name + faction
- Campaign affiliation
- Warband Rating (calculated)
- Record: W/L/D
- Last battle date
- Status: Active / Retired / Dead

### 3.5 Campaign History
Paginated list of all campaigns the user has participated in, with:
- Campaign name and dates
- Final placement
- Warband played
- Record

### 3.6 Notification Preferences
- Email: battle results, post-battle reminders, campaign announcements
- Push (future): via browser notifications
- Frequency: immediate / daily digest / weekly digest

---

## 4. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Registration flow completion time | < 2 minutes |
| Profile page load time | < 1 second |
| Avatar image upload max size | 2 MB |
| Username uniqueness | Enforced at DB level, case-insensitive |

---

## 5. UI/UX Notes

- Profile pages are **public by default** (other campaign members can see your record)
- Dashboard uses card-based layout inspired by tourplay.net's home page
- Mobile layout collapses cards into a vertical scrollable list
- Profile avatar appears in all battle reports and campaign standings

---

## 6. Out of Scope (v1.0)
- Social follows / friend lists
- Private messaging between players
- Public global rankings page (PRD-008 covers campaign rankings)
- OAuth with Battle.net or Warhammer Community login

---
