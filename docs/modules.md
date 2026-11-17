# NovaWorks AI Project Manager — Module Division (4 members)

Hypothetical split so all four can work in parallel. Reassign freely — each
module has a named fallback so nobody is ever blocked.

**Rule:** modules only start once the three shared artifacts are signed off:
API contract (endpoints in `server.ts`), data model (`data/novaworks.json`
shape), and AI output format (`server/ai.ts` → what Gemini must return).

## Module 1 — Data & Auth (model owner)

**Owns**
- Data model: users, roles, projects, tasks + links (drafts it, team signs off)
- JSON database operations with atomic writes (`server/db.ts`)
- Seed: 10 demo users, auto-created on first start (`server/seedData.ts`)
- Auth: HTTP-only session cookies, PBKDF2 password hashing (`server/crypto.ts`)
- Session/role middleware used by every other module

**Depends on:** nothing (starts first)
**Fallback:** Module 2

## Module 2 — Core API

**Owns**
- Projects / tasks / team endpoints in `server.ts` per contract
- Role scoping: admin sees all, manager sees assigned projects, agent sees own
  tasks — enforced server-side, ID probing blocked
- Reset/cleanup of generated projects/tasks between judge tests (keeps seeded
  users)

**Depends on:** contract + data-model signoff, M1 session middleware
**Fallback:** Module 1

## Module 3 — AI Pipeline

**Owns**
- Gemini transcript processing (`server/ai.ts`)
- Official + modified demo transcripts (`src/lib/transcriptSamples.ts`)
  — official must yield 3 projects / 12 tasks (UrbanCart 4, QuickServe 4,
  HelpDeskPro 4)
- Output validation: exact JSON shape (assignee, deadline, estimated hours)
- Error handling: bad JSON / quota exhausted → clean UI message

**Depends on:** contract + data model + AI output signoff
**Fallback:** Module 2

## Module 4 — Frontend

**Owns**
- React UI (`src/components/`, `src/App.tsx`)
- API client (`src/lib/api.ts`)
- Login page, role-guarded views: Admin (all), Manager (projects), Agent (tasks)
- Create from Transcript screen with the two presets
- Persistence check on refresh

**Split if overloaded:** 4a = auth + admin screens, 4b = manager/agent views.
**Depends on:** contract signoff (mock responses allowed before backend is ready)
**Fallback:** agreed with team (needs React familiarity)

## Ownership summary

| Module | Area | Fallback |
| :---- | :---- | :---- |
| M1 | Data model, seed, auth | M2 |
| M2 | Projects/tasks API, reset | M1 |
| M3 | AI pipeline, transcripts | M2 |
| M4 | Frontend | split 4a/4b |
