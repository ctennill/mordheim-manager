# Getting Started with Claude Code — Mordheim Manager
**For:** Clint Tennill  
**Date:** March 2026

---

## What Is Claude Code?

Claude Code is a command-line tool that lets you work with Claude as a coding agent directly in your terminal. Instead of copying and pasting code into the chat, you run Claude Code inside your project folder and Claude can:

- Read, write, and edit files directly
- Run commands (npm install, tests, builds)
- Navigate your file structure
- Work through multi-step coding tasks autonomously
- Keep context across your entire codebase

Think of it as having a senior developer sitting with you who can see and edit every file in your project.

---

## Step 1: Prerequisites

Before installing Claude Code, you need:

1. **Node.js 18+** — Download from https://nodejs.org (LTS version recommended)
   - Verify: open Terminal (Mac/Linux) or Command Prompt (Windows) and type:
     ```
     node --version
     ```
   - Should return `v18.x.x` or higher

2. **A Claude.ai Pro account** — You already have this.

3. **A terminal / command prompt** — Terminal on Mac, Windows Terminal on Windows

---

## Step 2: Install Claude Code

In your terminal, run:

```bash
npm install -g @anthropic-ai/claude-code
```

Then verify the install:
```bash
claude --version
```

---

## Step 3: Authenticate

Run:
```bash
claude
```

On first run, Claude Code will open a browser window for you to log in with your Claude.ai account. Once authenticated, you're ready to go.

---

## Step 4: Set Up Your Project

### 4a. Create a project folder

```bash
mkdir mordheim-manager
cd mordheim-manager
```

### 4b. Copy your PRDs into the project

Create a docs folder and put all your PRDs there:
```bash
mkdir docs
```

Copy all the `.md` files from your PRD output into `mordheim-manager/docs/`.

### 4c. Launch Claude Code in your project

```bash
claude
```

Claude Code is now running with full context of your project folder.

---

## Step 5: Your First Claude Code Session

Once inside Claude Code, start with this prompt to kick off the project:

```
I'm building the Mordheim Manager application described in the PRD documents 
in the /docs folder. 

Please start by:
1. Reading PRD-000-MASTER-OVERVIEW.md to understand the project
2. Scaffolding a new Next.js + TypeScript + Tailwind CSS project structure
3. Setting up a Supabase project connection (I'll provide credentials)
4. Creating the initial database schema based on the data models in PRD-002 
   through PRD-004

Start with the project scaffold and ask me any clarifying questions before 
writing code.
```

---

## Step 6: Recommended Build Order

Build the application in this order to stay unblocked:

### Phase 1 — Foundation (Week 1–2)
1. Project scaffold (Next.js + TypeScript + Tailwind)
2. Supabase setup + auth (PRD-001)
3. Database schema (warbands, warriors, campaigns, battles tables)
4. User registration and login screens

### Phase 2 — Core Data Entry (Week 3–4)
5. Faction database (seed data for all launch factions)
6. Warband Builder wizard (PRD-002)
7. Warrior profile views (PRD-003)
8. Campaign creation flow (PRD-004)

### Phase 3 — Active Play (Week 5–6)
9. Battle result entry form (PRD-005)
10. Post-battle sequence wizard (PRD-006)
11. Campaign standings table (PRD-008)

### Phase 4 — Polish (Week 7–8)
12. Territory system (PRD-007)
13. Notifications (PRD-010)
14. Print/export (PRD-011)
15. Analytics dashboard (PRD-009)

---

## Step 7: Useful Claude Code Prompting Patterns

### Starting a new feature
```
I want to build the Warband Builder feature described in PRD-002. 
Read that file and then create:
- The React component for the faction browser
- The Supabase schema for storing warband data
- The API route for saving a new warband
Follow the step-by-step wizard pattern described in section 3.2.
```

### Debugging
```
The warband builder is showing an error when I try to submit. 
Here is the error: [paste error]
Look at the relevant component and API route and fix it.
```

### Database migrations
```
I need to add the Serious Injury tracking described in PRD-003 section 6.1.
Create a Supabase migration file that adds the necessary columns to the 
warriors table and adds the injury_history table.
```

### Seeding game data
```
Create a seed script that populates the factions table with all 10 launch 
factions listed in PRD-000, section 4. Include all position types, stats, 
costs, and equipment availability.
```

---

## Step 8: Key Files Claude Code Will Create

After Phase 1, your project structure will look like:

```
mordheim-manager/
├── docs/                    ← Your PRDs
│   ├── PRD-000-MASTER-OVERVIEW.md
│   ├── PRD-001-...
│   └── ...
├── src/
│   ├── app/                 ← Next.js app router pages
│   │   ├── (auth)/          ← Login / Register pages
│   │   ├── dashboard/       ← Player dashboard
│   │   ├── campaigns/       ← Campaign pages
│   │   ├── warbands/        ← Warband builder + profiles
│   │   └── api/             ← API routes
│   ├── components/          ← Reusable UI components
│   │   ├── warriors/
│   │   ├── campaign/
│   │   └── ui/
│   ├── lib/
│   │   ├── supabase.ts      ← Database client
│   │   ├── game-rules/      ← Mordheim rules logic (tables, calculations)
│   │   └── utils/
│   └── types/               ← TypeScript types for all data models
├── supabase/
│   └── migrations/          ← Database schema files
├── docs/
└── package.json
```

---

## Step 9: Supabase Setup (Free Tier)

1. Go to https://supabase.com and create a free project
2. Name it `mordheim-manager`
3. Copy your project URL and anon key from Settings → API
4. Tell Claude Code:
   ```
   I have a Supabase project set up. My project URL is [URL] and my anon 
   key is [KEY]. Please create a .env.local file with these values and set 
   up the Supabase client.
   ```

---

## Tips for Working with Claude Code

1. **Keep sessions focused** — Work on one feature at a time. "Build the entire app" in one prompt produces worse results than "build the warband builder wizard."

2. **Reference the PRDs constantly** — Say "as described in PRD-003 section 5" to anchor Claude to your specifications.

3. **Review before accepting** — Claude Code will show you changes before applying them. Read them. It's fast but not infallible.

4. **Commit frequently** — Initialize git in your project and commit after each working feature.
   ```bash
   git init
   git add .
   git commit -m "feat: add warband builder wizard"
   ```

5. **Use /clear between features** — Typing `/clear` in Claude Code resets the conversation context. Use this when switching to a new feature to avoid confusion from previous context.

6. **Ask for explanations** — If Claude writes code you don't understand, ask: "Explain what this component does and why you structured it this way."

---

## Quick Reference: Key Claude Code Commands

| Command | What It Does |
|---|---|
| `claude` | Start Claude Code in current directory |
| `/help` | Show available commands |
| `/clear` | Clear conversation history (keep files) |
| `/cost` | Show token usage for current session |
| `Escape` | Cancel Claude's current action |
| `Ctrl+C` | Exit Claude Code |

---

## You're Ready to Build

With your PRD suite complete, you have everything Claude Code needs to build this application systematically. The PRDs serve as:

1. **Specification** — What to build
2. **Context** — Why decisions were made
3. **Reference** — Game rules data that must be coded accurately

Start with Phase 1, get something running in the browser, and iterate from there. Good luck — and may your warbands prosper in Mordheim's ruins! ⚔️

---
