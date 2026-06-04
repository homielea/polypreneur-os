# Implementation Plan: Polypreneur OS

> Status: **DRAFT** — awaiting human review before Phase 3 (Tasks).
> Source spec: [`docs/spec.md`](./spec.md)
> Last updated: 2026-06-04

## Overview

Migrate the existing Lovable scaffold from a localStorage prototype to a Supabase-backed personal portfolio dashboard for one solopreneur managing 6+ ventures. Strip the dead weight, install Supabase as the spine, build the portfolio view as the home screen, then layer in daily check-ins, the AI assistant (Anthropic via Edge Function), and the idea vault. No external integrations in v1.

## Architecture decisions

- **Vertical slicing.** Every phase ends with a feature a human can actually use. No "build the whole DB, then the whole API, then the whole UI" sequencing.
- **Supabase first.** Phase 1 isn't optional — every later task assumes auth, schema, and RLS exist. Build it once, properly.
- **Generated types over hand-rolled types.** `supabase gen types typescript` → `src/types/db.ts`. Domain types in `src/types/domain.ts` wrap them. Never let DB shape leak into components.
- **TanStack Query owns all server state.** Components never call `supabase.from(...)` directly — only via hooks in `src/hooks/`. Keeps caching, optimistic updates, and invalidation in one layer.
- **AI runs server-side only.** Anthropic SDK lives in a Supabase Edge Function. The browser never sees an `ANTHROPIC_API_KEY`. The client calls a single typed RPC.
- **Demolition before construction.** The Phase 0 purge removes the dead-weight components before they tempt anyone to "just integrate" them. Lower cognitive overhead beats theoretical reuse.
- **No PWA / offline / real-time in v1.** Network-online assumed. Real-time can come if multi-device proves painful — not before.

## Dependency graph

```
Phase 0: Purge dead code
    │
    ▼
Phase 1: Supabase foundation (schema, RLS, auth, types, env)
    │
    ▼
Phase 2: Auth + app shell (login, protected routes, layout)
    │
    ▼
Phase 3: Portfolio core (project CRUD + portfolio grid + workspace)
    │   ─┬─► Phase 4: Daily loop (check-in, reflection, trend)
    │    │
    │    └─► Phase 5: AI assistant (edge function + sheet)
    │                  (depends on real project data existing)
    │
    ▼
Phase 6: Ideas (capture, vault, promote-to-project)
    │
    ▼
Phase 7: Dogfood gate (bulk import 6 projects, deploy, 7-day usage)
```

Phases 4 and 5 are **parallelizable** once Phase 3 is complete. Everything else is sequential.

---

## Phase 0: Purge dead code

Goal: lower cognitive load before building. The audit named these components as scrap; remove them in one PR so future phases never see them.

### Task 0.1: Remove unused components and routes

**Description:** Delete the components and pages the audit flagged as dead weight. Update `App.tsx` routes and `Index.tsx` modal/tab imports accordingly.

**Acceptance criteria:**
- [ ] Files deleted: `VoiceProjectCreator.tsx`, `KanbanBoard.tsx`, `KeyboardShortcuts.tsx`, `TouchOptimizedButton.tsx`, `OnboardingWizard.tsx`, `TemplateLibrary.tsx`, `AnimatedCard.tsx`, `EnhancedLoadingSpinner.tsx`, `pages/StrategyLibrary.tsx`, `hooks/useVoiceRecognition.ts`
- [ ] `App.tsx` no longer routes to `/strategy`
- [ ] No dangling imports anywhere in `src/`

**Verification:**
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds with zero unused-import warnings
- [ ] App still loads (`bun run dev`, manual smoke test of `/` and `/project/:id`)

**Dependencies:** None
**Files:** ~10 deletes, edits to `src/App.tsx`, `src/pages/Index.tsx`
**Size:** S

### Task 0.2: Add typecheck and test scripts

**Description:** Wire `tsc --noEmit` as `typecheck`, install Vitest, add `test` script. No tests written yet — just the harness.

**Acceptance criteria:**
- [ ] `bun run typecheck` exists and passes against current code
- [ ] `bun run test` runs vitest (zero tests = pass)
- [ ] Vitest config at `vitest.config.ts` set up with jsdom env + path alias matching Vite

**Verification:**
- [ ] Both scripts exit 0 from a clean checkout

**Dependencies:** None (can run in parallel with 0.1)
**Files:** `package.json`, new `vitest.config.ts`
**Size:** XS

### Checkpoint: Phase 0 complete
- [ ] `lint`, `typecheck`, `build`, `test` all green
- [ ] Repo is smaller and the dead components are gone
- [ ] Human reviews the deletion diff before moving on

---

## Phase 1: Supabase foundation

Goal: install the spine. Auth, schema, RLS, generated types, env config. After this phase nothing user-visible has changed, but every later task can assume Supabase exists.

### Task 1.1: Init Supabase locally + create project

**Description:** Install Supabase CLI deps, init the local Supabase project (Docker stack), document the connection in README. Create a remote Supabase project for staging.

**Acceptance criteria:**
- [ ] `supabase/` directory created with `config.toml`
- [ ] `bunx supabase start` brings up local stack (verified manually)
- [ ] Remote project exists; project ref recorded in `.env.example`
- [ ] `.env.example` includes `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] `.env.local` is gitignored

**Verification:**
- [ ] Local Supabase studio reachable at `http://localhost:54323`
- [ ] `psql` against local DB succeeds

**Dependencies:** Phase 0
**Files:** `supabase/config.toml`, `.env.example`, `.gitignore`, `README.md`
**Size:** S

### Task 1.2: Initial schema migration

**Description:** Write the migration creating `projects`, `ideas`, `daily_checkins`, `evening_reflections`, `project_phases`, `project_strategy` per the spec's data model. RLS enabled on every table with `user_id = auth.uid()` policies.

**Acceptance criteria:**
- [ ] One migration file under `supabase/migrations/` (timestamped)
- [ ] All 6 tables created with correct columns, FKs, check constraints
- [ ] RLS enabled on every table; SELECT/INSERT/UPDATE/DELETE policies all scoped to `user_id`
- [ ] Indexes on `(user_id, status)` for `projects`, `(user_id, date)` for check-ins
- [ ] Migration runs cleanly on a fresh local DB

**Verification:**
- [ ] `bunx supabase db reset` succeeds
- [ ] Manual: with two test users, user A cannot read user B's rows via the anon-key API

**Dependencies:** 1.1
**Files:** `supabase/migrations/00001_init.sql`
**Size:** M

### Task 1.3: Generate TypeScript types + Supabase client

**Description:** Wire `supabase gen types typescript` into a script. Create `src/lib/supabase.ts` exporting a typed client singleton. Create `src/types/domain.ts` with hand-rolled domain types that wrap the DB types.

**Acceptance criteria:**
- [ ] `bun run db:types` script regenerates `src/types/db.ts`
- [ ] `src/lib/supabase.ts` exports a typed `supabase` client using `VITE_SUPABASE_*` env vars
- [ ] `src/types/domain.ts` defines `Project`, `Idea`, `DailyCheckIn`, `EveningReflection`, `Phase` — each importing from `db.ts`
- [ ] Old localStorage-shape types in `src/types/` are deleted

**Verification:**
- [ ] `bun run typecheck` passes
- [ ] Importing `supabase` and calling `supabase.from('projects').select()` typechecks correctly (autocompletes columns)

**Dependencies:** 1.2
**Files:** `package.json`, `src/lib/supabase.ts`, `src/types/db.ts` (generated), `src/types/domain.ts`
**Size:** S

### Checkpoint: Phase 1 complete
- [ ] Local Supabase up, migrations apply cleanly
- [ ] RLS verified manually with two users
- [ ] Types generate; typecheck passes
- [ ] **Human reviews migration SQL before merge** (per "Ask first" boundary)

---

## Phase 2: Auth + app shell

Goal: a logged-in user lands on an empty Portfolio page. No projects yet — that's Phase 3 — but auth, layout, and routing all work.

### Task 2.1: GitHub OAuth via Supabase Auth

**Description:** Configure GitHub OAuth provider in Supabase dashboard (staging). Build `src/pages/Login.tsx` with a single "Continue with GitHub" button calling `supabase.auth.signInWithOAuth({ provider: 'github' })`. Handle the OAuth callback.

**Acceptance criteria:**
- [ ] GitHub OAuth app created; callback URL is the Supabase auth callback
- [ ] Login page exists at `/login`
- [ ] Successful sign-in redirects to `/`
- [ ] `useSession()` hook returns the current session reactively

**Verification:**
- [ ] Manual: click button, complete GitHub OAuth, land on `/` with session
- [ ] `supabase.auth.getUser()` returns a real user with non-null `id`

**Dependencies:** 1.3
**Files:** `src/pages/Login.tsx`, `src/hooks/useSession.ts`, `src/App.tsx`
**Size:** S

### Task 2.2: Protected routes + layout shell

**Description:** Wrap routes in a `<RequireAuth>` component that redirects to `/login` if no session. Replace `Index.tsx` with `Portfolio.tsx` as the `/` route. Build a minimal layout: top bar with project switcher placeholder + user avatar + sign-out.

**Acceptance criteria:**
- [ ] `/`, `/project/:id` redirect to `/login` when signed out
- [ ] `/login` redirects to `/` when signed in
- [ ] Layout component renders consistent shell across pages
- [ ] Sign-out works and returns to `/login`

**Verification:**
- [ ] Manual: sign in, sign out, try direct URL while logged out — all flows correct
- [ ] No flash of unauthenticated content (loading state while session resolves)

**Dependencies:** 2.1
**Files:** `src/components/auth/RequireAuth.tsx`, `src/components/layout/AppShell.tsx`, `src/pages/Portfolio.tsx`, `src/App.tsx`
**Size:** S

### Task 2.3: Install TanStack Query provider + Sonner

**Description:** Wrap the app in `QueryClientProvider` with sane defaults (staleTime 30s, refetchOnWindowFocus true). Ensure Sonner toaster is mounted at the root. No actual queries yet.

**Acceptance criteria:**
- [ ] `QueryClient` configured in `src/main.tsx`
- [ ] React Query devtools mounted in dev only
- [ ] Toaster reachable from any component via `import { toast } from "sonner"`

**Verification:**
- [ ] DevTools panel visible in dev build
- [ ] A throwaway `toast.success("hi")` call from any component renders the toast

**Dependencies:** 2.2 (or parallel with it — same files)
**Files:** `src/main.tsx`
**Size:** XS

### Checkpoint: Phase 2 complete
- [ ] Auth works end-to-end; protected routes behave correctly
- [ ] App shell renders; no console errors
- [ ] You can sign in as yourself with your real GitHub account

---

## Phase 3: Portfolio core

Goal: the headline feature. After this phase you have a working portfolio dashboard with 6 projects of your real data on it.

### Task 3.1: Project list query + Portfolio grid

**Description:** Build `useProjects()` TanStack hook reading from Supabase, scoped to current user. Render `<ProjectCard>` grid on the Portfolio page. Empty state if no projects. Cards show: title, type, status, stage, last-activity, current blocker.

**Acceptance criteria:**
- [ ] `useProjects()` returns `{ data, isLoading, error }` with typed `Project[]`
- [ ] `ProjectCard` matches the snippet in the spec (style section)
- [ ] Portfolio renders a 1/2/3-column responsive grid
- [ ] Empty state shows a "Create your first project" CTA
- [ ] Loading state shows skeletons (not a spinner)

**Verification:**
- [ ] Manually insert 3 rows into local Supabase → they render correctly
- [ ] Component test for `ProjectCard` covering: with-blocker, without-blocker, all status variants
- [ ] Lighthouse Performance ≥ 90 on Portfolio with 6 projects

**Dependencies:** Phase 2
**Files:** `src/hooks/useProjects.ts`, `src/components/portfolio/ProjectCard.tsx`, `src/pages/Portfolio.tsx`, `src/components/portfolio/ProjectCard.test.tsx`
**Size:** M

### Task 3.2: Create-project flow

**Description:** "New project" button on Portfolio opens a shadcn `<Dialog>` with a React Hook Form + Zod schema. Required: title, type, status. Optional: north-star metric. On submit: insert via Supabase, optimistic update via TanStack mutation, toast on success.

**Acceptance criteria:**
- [ ] Zod schema rejects empty title and invalid type/status
- [ ] Mutation invalidates the `projects` query key on success
- [ ] Optimistic update: new card appears before the network round-trip
- [ ] Error path shows a destructive toast and rolls back the optimistic update

**Verification:**
- [ ] Create project → it appears on Portfolio immediately
- [ ] Simulate offline → see rollback + error toast
- [ ] Form test: invalid input shows validation errors

**Dependencies:** 3.1
**Files:** `src/components/portfolio/CreateProjectDialog.tsx`, `src/hooks/useProjects.ts` (mutation added), `src/lib/schemas.ts`
**Size:** M

### Task 3.3: Momentum score

**Description:** Pure function `computeMomentum(project, checkins): number` in `src/lib/momentum.ts`. Inputs: recency of last activity, recency of stage change, presence of blocker, check-in frequency. Output: 0-100. Render as `<MomentumIndicator>` on the card.

**Acceptance criteria:**
- [ ] `momentum.ts` is pure (no side effects, no Supabase calls)
- [ ] Table-driven tests covering: stale project, fresh project, blocked project, never-touched project
- [ ] `MomentumIndicator` shows score + a color band (red < 30, amber 30-70, green > 70)
- [ ] Algorithm documented in an ADR (`docs/adr/0001-momentum-score.md`)

**Verification:**
- [ ] Unit tests pass with ≥95% coverage on `momentum.ts`
- [ ] Manual: stale-data project visibly lower than fresh project

**Dependencies:** 3.1 (parallel with 3.2 — different files)
**Files:** `src/lib/momentum.ts`, `src/lib/momentum.test.ts`, `src/components/portfolio/MomentumIndicator.tsx`, `docs/adr/0001-momentum-score.md`
**Size:** M

### Task 3.4: Project workspace + inline edit

**Description:** Refactor `ProjectWorkspace.tsx` to fetch a single project via `useProject(id)`. Show editable fields (title, status, stage, blocker, north-star). Each field is inline-editable (click to edit, blur to save). Mutation persists via Supabase.

**Acceptance criteria:**
- [ ] Drill-down from Portfolio card opens the workspace at `/project/:id`
- [ ] Each field has an inline-edit affordance (visible on hover)
- [ ] Save is optimistic; failure rolls back and toasts
- [ ] Updating any field updates `last_activity_at` on the project row

**Verification:**
- [ ] Edit title → portfolio card reflects new title on back-navigation
- [ ] `last_activity_at` changes after every edit (check DB directly)

**Dependencies:** 3.2, 3.3
**Files:** `src/pages/ProjectWorkspace.tsx`, `src/hooks/useProject.ts`, `src/components/project/InlineEdit.tsx`
**Size:** M

### Checkpoint: Phase 3 complete
- [ ] You can create, view, edit projects against real Supabase
- [ ] Momentum score visible and sane
- [ ] No console errors in any flow
- [ ] **Mid-build review**: human reviews the Portfolio UX with 3 hand-entered projects before continuing

---

## Phase 4: Daily loop (parallelizable with Phase 5)

Goal: log a check-in, see a 14-day trend, get a "today's focus" recommendation grounded in the data.

### Task 4.1: Daily check-in form

**Description:** Migrate the existing `DailyCheckIn` component to Supabase. Single sheet from the Portfolio top bar. Fields: mood (1-5), energy (1-5), focus (1-5), focus project (select from current projects), intentions (text). Enforce one check-in per `(user_id, date)` via the unique constraint.

**Acceptance criteria:**
- [ ] Sheet opens via "Check in" button on Portfolio
- [ ] Today's existing check-in pre-fills the form (edit mode)
- [ ] Submit persists via mutation; toast on success
- [ ] Unique-constraint violation surfaces a friendly error, not a 500

**Verification:**
- [ ] Submit a check-in → row appears in `daily_checkins`
- [ ] Submit again same day → form pre-fills, second submit updates not inserts

**Dependencies:** Phase 3
**Files:** `src/components/checkin/DailyCheckIn.tsx`, `src/hooks/useCheckins.ts`, `src/lib/schemas.ts`
**Size:** M

### Task 4.2: Evening reflection form

**Description:** Same shape as 4.1 but for `evening_reflections` (satisfaction, completion, what worked, what blocked). Surfaced from the same top-bar control with a tab toggle.

**Acceptance criteria:**
- [ ] Reuses the sheet UI from 4.1; tab toggle picks morning vs evening
- [ ] Unique-constraint handled identically

**Verification:**
- [ ] Both forms persist independently per day

**Dependencies:** 4.1
**Files:** `src/components/checkin/EveningReflection.tsx`, `src/hooks/useCheckins.ts` (extend)
**Size:** S

### Task 4.3: 14-day trend chart on Portfolio

**Description:** Below the project grid, a Recharts line chart showing mood/energy/focus over the last 14 days. Refactor of the existing `AnalyticsDashboard` but pulling real data from Supabase via a new `useCheckinTrend()` hook.

**Acceptance criteria:**
- [ ] Chart renders even with zero data (empty-state message)
- [ ] X-axis = dates, three lines for mood/energy/focus
- [ ] Smooth handling of gaps (missed days don't crash the chart)
- [ ] Responsive: stacks on mobile

**Verification:**
- [ ] Manual: insert 10 days of check-ins → line chart renders correctly with gaps
- [ ] Hook test covering empty / sparse / dense data

**Dependencies:** 4.1
**Files:** `src/components/portfolio/CheckinTrend.tsx`, `src/hooks/useCheckinTrend.ts`
**Size:** M

### Checkpoint: Phase 4 complete
- [ ] You log a check-in, see it on the trend chart
- [ ] Today's focus project is visibly linked to the check-in row

---

## Phase 5: AI assistant (parallelizable with Phase 4)

Goal: Cmd+K opens a sheet; you ask "what should I work on today?" and get a grounded answer that names your projects.

### Task 5.1: Anthropic Edge Function

**Description:** Supabase Edge Function `assistant` that accepts `{ question: string }`, validates the caller's JWT, pulls the user's projects + recent check-ins from Postgres, builds a grounded prompt, calls Anthropic, returns the response. Streaming via SSE.

**Acceptance criteria:**
- [ ] Function deploys via `supabase functions deploy assistant`
- [ ] `ANTHROPIC_API_KEY` is a Supabase function secret, never in client code
- [ ] Function rejects unauthenticated requests
- [ ] Returns a streaming response (SSE)
- [ ] Prompt includes a structured summary of all user projects + last 7 check-ins
- [ ] Uses Claude Sonnet 4.6 (`claude-sonnet-4-6`)

**Verification:**
- [ ] Local: `bunx supabase functions serve assistant` + curl with a session JWT → streaming response
- [ ] Without JWT → 401
- [ ] Integration test against local stack

**Dependencies:** Phase 3 (needs real project data to ground responses)
**Files:** `supabase/functions/assistant/index.ts`, `supabase/functions/assistant/prompt.ts`, `supabase/functions/assistant/index.test.ts`
**Size:** M

### Task 5.2: Assistant sheet UI

**Description:** Right-side `<Sheet>` opened by `Cmd+K`. Single text input, message history (this session only, no persistence in v1), streaming response renders token-by-token. Replaces the existing stub `AIAssistantPanel.tsx`.

**Acceptance criteria:**
- [ ] Cmd+K (Ctrl+K on Windows/Linux) toggles the sheet from anywhere
- [ ] Submit sends the question via the Edge Function client
- [ ] Tokens stream into the UI as they arrive
- [ ] Errors (network, 4xx, 5xx) show a friendly inline message
- [ ] Conversation cleared when sheet closes

**Verification:**
- [ ] Open → ask "what should I work on?" → see grounded response mentioning your real projects by name
- [ ] Network throttle to slow 3G → still feels responsive (tokens stream)

**Dependencies:** 5.1
**Files:** `src/components/ai/AssistantSheet.tsx`, `src/hooks/useAssistant.ts`, deletion of `src/components/AIAssistantPanel.tsx`
**Size:** M

### Checkpoint: Phase 5 complete
- [ ] Cmd+K asks a question, gets a grounded answer with your real project names
- [ ] No API key in client bundle (verify by grep on production build)

---

## Phase 6: Ideas

Goal: capture, score, promote-to-project — all backed by Supabase.

### Task 6.1: Idea capture sheet

**Description:** "Capture idea" button → bottom sheet. Single text area + optional category dropdown. Submit creates an `ideas` row with status='raw'. Target: under 15 seconds from idea to saved.

**Acceptance criteria:**
- [ ] Sheet opens via top-bar button + keyboard shortcut (Cmd+I)
- [ ] Form has one required field (title); everything else optional
- [ ] Submit closes sheet, toasts, invalidates ideas query

**Verification:**
- [ ] Time the flow: open → type → save. Under 15s is the target.

**Dependencies:** Phase 3 (needs auth + TanStack Query setup)
**Files:** `src/components/ideas/IdeaCaptureSheet.tsx`, `src/hooks/useIdeas.ts`
**Size:** S

### Task 6.2: Idea vault grid (Supabase-backed)

**Description:** Migrate the existing `IdeaVaultGrid` and `IdeaVaultWizard` away from localStorage. Same UX, real persistence. Idea scoring stays as a pure function in `src/lib/scoring.ts` (mock heuristics for now; AI scoring is v2).

**Acceptance criteria:**
- [ ] All 4 score fields (PMF, portfolio fit, launch speed, AI priority) computed and stored
- [ ] Vault renders all user's ideas with status filters
- [ ] Existing wizard flow preserved but persists to Supabase

**Verification:**
- [ ] Create idea via wizard → row in `ideas` with all scores populated
- [ ] Filter by status works

**Dependencies:** 6.1
**Files:** `src/components/ideas/IdeaVaultGrid.tsx`, `src/components/ideas/IdeaVaultWizard.tsx`, `src/lib/scoring.ts`, `src/lib/scoring.test.ts`
**Size:** M

### Task 6.3: Promote idea to project

**Description:** "Promote" action on an idea card opens a confirmation dialog and creates a new project pre-filled from the idea's fields. Sets `ideas.promoted_to_project_id` and `ideas.status = 'promoted'`. Transactional via an RPC.

**Acceptance criteria:**
- [ ] Promote button visible only on `raw` or `validated` ideas
- [ ] Single Supabase RPC creates project + updates idea atomically (both succeed or both fail)
- [ ] After promote: idea card moves to "promoted" filter; new project appears on Portfolio

**Verification:**
- [ ] Promote → check both tables updated
- [ ] Force RPC to fail mid-way (test in dev) → idea status not changed

**Dependencies:** 6.2
**Files:** `supabase/migrations/00002_promote_idea_rpc.sql`, `src/hooks/useIdeas.ts` (mutation added)
**Size:** M

### Checkpoint: Phase 6 complete
- [ ] Full idea lifecycle works: capture → score → promote → project

---

## Phase 7: Dogfood gate

Goal: ship to production and use it for real.

### Task 7.1: Bulk import 6 projects

**Description:** One-off CSV import script (`scripts/import-projects.ts`) reading a local CSV and inserting into the remote `projects` table via the service-role key. Documented in `docs/import.md`. Not exposed in the UI — engineering tool only.

**Acceptance criteria:**
- [ ] Script accepts a CSV path arg
- [ ] Dry-run mode prints what it would insert
- [ ] Real run inserts to staging Supabase

**Verification:**
- [ ] Run against staging with your 6 real projects → all 6 appear on Portfolio
- [ ] Dry-run never writes

**Dependencies:** Phase 3
**Files:** `scripts/import-projects.ts`, `docs/import.md`
**Size:** S

### Task 7.2: Deploy to Vercel + production Supabase

**Description:** Provision production Supabase project, run migrations against it, deploy Edge Functions, deploy the SPA to Vercel. Env vars wired in Vercel; preview deploys per PR.

**Acceptance criteria:**
- [ ] Production Supabase exists; migrations applied
- [ ] `assistant` Edge Function deployed to production
- [ ] Vercel project linked to GitHub repo; pushes to `main` deploy
- [ ] Preview deploys trigger on PRs
- [ ] `.env.production` documented (not committed)

**Verification:**
- [ ] Visit production URL → sign in with GitHub → see your 6 imported projects
- [ ] Open Cmd+K → ask question → get response from production Edge Function

**Dependencies:** All prior tasks
**Files:** Vercel config (via dashboard), `README.md` deployment section
**Size:** M

### Task 7.3: 7-day dogfood usage

**Description:** Not a code task. Use the app every day for 7 consecutive days. Log issues / friction in `docs/dogfood-log.md`. After 7 days, decide v1.1 backlog.

**Acceptance criteria:**
- [ ] 7 daily check-ins logged
- [ ] At least one Cmd+K interaction per day
- [ ] Friction log has at least 5 entries

**Verification:**
- [ ] Spec's success criterion #7 met ("7 consecutive days without falling back to a spreadsheet")

**Dependencies:** 7.2
**Files:** `docs/dogfood-log.md`
**Size:** N/A (not code)

### Checkpoint: v1 done
- [ ] All seven success criteria from the spec are met
- [ ] Spec status updated to "shipped"
- [ ] Open follow-up issues for the v1.1 backlog (likely: integrations, idea AI scoring, more advanced momentum signals)

---

## Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS misconfigured → cross-user data leak (even single-tenant, future multi-tenant inherits the bug) | High | Task 1.2 includes manual two-user verification before merging. Add a Vitest integration suite in Phase 1 that exercises RLS with two test users. |
| Anthropic costs balloon during dogfooding | Med | Edge Function logs token usage per call. Add a soft daily cap (e.g. 100 calls/user/day) in Task 5.1 — returns a friendly error on exceed. |
| Supabase free-tier limits hit mid-dogfood | Low | 6 projects + 7 days of check-ins is well within free tier (500 MB db, 50k MAU). Monitor; upgrade if needed. |
| Edge Function cold-start latency makes Cmd+K feel sluggish | Med | Stream tokens (Task 5.1 acceptance criterion). Pre-warm via a no-op ping on app load. |
| Migration script drift between local and staging/prod | Med | All schema changes go through `supabase/migrations/`. Never hand-edit prod. Document the deploy flow in 7.2. |
| Inline editing causes save-on-every-keystroke spam | Low | Debounce save on blur, not on change. Add to Task 3.4 acceptance criteria. |
| OAuth callback URL mismatch between local/staging/prod | Med | Document all three URLs in `docs/setup.md` (Task 1.1). |
| Optimistic updates leave the cache stale on partial failure | Med | TanStack Query's `onError` rollback pattern is the canonical answer; tested in Task 3.2. |

## Parallelization plan

- **Phases 0 → 1 → 2 → 3 are strictly sequential.** Foundation has to land in order.
- **Phases 4 and 5 are parallelizable** after Phase 3 completes. Different files, no shared state. If two agents are available: one takes Phase 4, the other takes Phase 5.
- **Phase 6 must wait** for Phase 3 (needs project creation flow) but is independent of 4/5.
- **Phase 7 is the final gate** — depends on everything.

## Open questions

None blocking. The following will be answered during implementation, not now:

- Exact weights in the momentum scoring algorithm (Task 3.3 will iterate based on dogfooding)
- Exact Anthropic model parameters for `assistant` (Task 5.1 starts with sensible defaults)
- Whether to use Vercel's analytics or skip (decide after deploy in Task 7.2)

---

## Verification (per planning-and-task-breakdown skill)

- [x] Every task has acceptance criteria
- [x] Every task has a verification step
- [x] Task dependencies are identified and ordered correctly
- [x] No task touches more than ~5 files (largest is ~5)
- [x] Checkpoints exist between every phase
- [ ] **The human has reviewed and approved this plan** ← we are here

**Next step:** review this plan, push back on anything wrong, then I'll advance to Phase 3 (Tasks — breaking the largest tasks above into per-session work items if any feel too big).
