# NovaWorks AI Project Manager — How We Do It (execution plan)

## Locked decisions

| Decision | Choice |
| :---- | :---- |
| Project | NovaWorks AI Project Manager |
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript (`tsx`, single `server.ts`) |
| Database | Persistent local JSON file with atomic writes (`data/novaworks.json`) |
| AI | Google Gemini via `@google/genai` (`GEMINI_API_KEY`) |
| Auth | HTTP-only session cookies + PBKDF2 password hashing |
| Layout | Single package: `server/`, `src/`, `data/` |
| Git | `main` always working; feature branches; merges via PR |
| Deploy | Local-only demo at http://localhost:3000 + demo video |

## Repo layout

```
hackathon/
├── src/                    # React frontend               (M4)
│   ├── components/
│   ├── lib/api.ts          # frontend API client
│   └── lib/transcriptSamples.ts  # demo transcripts        (M3)
├── server/                 # backend modules
│   ├── db.ts               # JSON database                (M1)
│   ├── crypto.ts           # password hashing             (M1)
│   ├── seedData.ts         # demo users                   (M1)
│   └── ai.ts               # Gemini processing            (M3)
├── server.ts               # Express routes + Vite server (M2)
├── data/novaworks.json     # persistent database
└── docs/                   # contract, modules, plan
```

## Phases

### Phase 0 — Signoff (one meeting, ~2h)
1. Write the API contract — every endpoint, request, response shape
   (extract from `server.ts` if already built; freeze it)
2. M1 documents the data model (users/roles/projects/tasks) → team signs off
3. Fix the AI output JSON shape — exact fields Gemini must return
4. Agree env var names → keep `.env.example` accurate
5. Verify Gemini API key/quota now, not demo day

### Phase 1 — Parallel build
- M1: db + seed + hashing + session middleware
- M2: project/task/team endpoints against contract
- M3: Gemini prompt + output validation + transcript presets
- M4: UI against contract with mock data

Shared TypeScript types land in `src/types/` so everyone compiles against them.

### Phase 2 — Integration
1. Wire session middleware into all routes
2. End-to-end: login → official transcript → 3 projects / 12 tasks
3. Run the demo flow tests (below), fix failures
4. Verify reset deletes generated rows, keeps seeded users

### Phase 3 — Hardening + submission
1. Authorization probes: manager/agent cannot fetch other users' IDs
2. AI failure paths: bad JSON / quota → friendly error
3. Keep README accurate (features, limitations, demo video)
4. Record/refresh demo video (required — local database)
5. Optional later: host frontend + backend + a hosted DB for bonus marks

## Demo flow to verify (mirrors README)

1. `npm run dev` → http://localhost:3000
2. Login as Admin → Create from Transcript → official preset
3. Expect 3 projects / 12 tasks (UrbanCart 4, QuickServe 4, HelpDeskPro 4)
4. Manager view: only assigned projects; Agent view: only assigned tasks
5. Refresh → everything persists
6. Modified transcript preset → AI reacts to changed input

## Git rules

- `main` stays working — never push broken builds
- Work on `feature/<module>-<topic>` branches (e.g. `feature/m1-auth`)
- Merges go through a pull request with one other member's review
- Small, frequent commits; conventional style (`feat:`, `fix:`, `docs:`)

## Definition of done (per module)

- [ ] Code merged to `main` via PR
- [ ] Contract honored exactly (no ad-hoc endpoint shapes)
- [ ] Tested with a REST client (Bruno/Insomnia/Postman) before frontend integration
- [ ] `npm run lint` (tsc) passes
- [ ] README commands still work from a clean clone
