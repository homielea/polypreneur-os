# Progress

Build log for Polypreneur OS v1 (spec: `polypreneur-os-fable5-spec.md`). One or two lines per commit, newest last.

## v1 status: COMPLETE

All three spec features plus the landing page are built, tested (13 vitest tests), and pushed. See BLOCKERS.md for the one open item (live e2e verification blocked by the build sandbox's network policy — works on a normal machine). What I'd do next if the session continued: a live end-to-end pass against the real Supabase project from a network-enabled session, then deployment (needs Lea — hard-stop item), then v2 groundwork (Neglect Radar as a third `LeverageProvider`, Reflection → Content Pipe reading ledger tags).

## Feature 1 — App shell + auth + Supabase schema

- Committed the v1 spec and brand context (`.agents/product-marketing-context.md`) into the repo.
- Purged legacy Lovable feature components (Kanban, voice input, canvases, template library, old pages); kept shadcn `ui/` primitives, `ErrorBoundary`, `NotFound`.
- Added Supabase: `@supabase/supabase-js`, client in `src/lib/supabase.ts`, `.env.example`, and full v1 schema with RLS in `supabase/migrations/0001_init.sql` (actions, score_events, ledger_entries, ideas, waitlist_signups).
- Auth: email/password via `AuthContext`, `/login` page with signin/signup toggle, protected `/app` routes.
- App shell: responsive sidebar layout with Today / Ledger / Ideas nav; placeholder pages for features 2–4.

## Feature 2 — Highest-Leverage Home Screen + scoring engine

- Scoring engine as a standalone service in `src/lib/scoring/`: no React/Supabase imports in the core (`engine.ts`), persistence injected via a `ScoreStore` interface, providers pluggable via `registerProvider` (v2's Neglect Radar / Reflection Pipe just implement `LeverageProvider`).
- v1 providers: `manual-leverage` (user's 1–5 rating × 10) and `top20-boost` (+15 for actions promoted from 80/20 triage). Ranking reasons are shown in the UI so ordering is never a black box.
- 7 vitest tests cover ranking, tie-breaks, pluggability, additive-only enforcement, and event recording (`bun run test`).
- Today screen: quick add (title / category / leverage), ranked open-action list with complete + delete, quiet "gathered this week" per-category totals — no targets, streaks, or comparisons.
- Completing an action records a score event worth its leverage rating in its category.

## Feature 3 — Great Inversion Ledger

- Global quick-capture mounted once in the app layout: floating "Log judgment" button + ⌘/Ctrl+J from anywhere in the app; sheet with situation / judgment / outcome / tags. Only situation + judgment required — outcome can be added when known (low capture friction).
- Ledger page: reverse-chronological entry cards with timestamps, tag badges, hover-delete, and tag-filter chips (groundwork for the v2 Reflection → Content Pipe).
- Tags normalized (trimmed, lowercased, deduped) by `parseTags` — 3 more vitest tests (10 total).

## Feature 4 — 80/20 Enforcer + Idea Vault

- Idea capture on the Ideas page with a forced triage step: there is no plain save — every capture answers "is this in the top 20% of leverage right now?". Vault is the low-friction default; acting requires picking a category + leverage and lands the idea on Today as an `idea_promotion` action (which earns the top20-boost in ranking).
- Vault resurfacing: vaulted ideas rest for 30 days, then move to a gentle "Worth another look?" queue with three choices — act on it, rest another interval, or let go (archived, never deleted). No due dates, nothing turns red.
- `partitionVault` / `nextResurfaceDate` helpers in `src/lib/vault.ts` with 3 more tests (13 total).

## Feature 5 — Landing page

- Public `/` route: hero, scene-first problem/positioning section built around The Great Inversion, the three v1 features as proof points, maker note signed by Lea, waitlist capture (top + bottom) writing to `waitlist_signups`.
- Copy written directly from `.agents/product-marketing-context.md` guardrails: no countdowns, no scarcity, no gamified urgency; duplicate signups get a friendly "already on the list" instead of an error; quiet "Flow on." footer.
- Verified in headless Chromium against the production build: all sections render, no console errors (screenshot shared in session).

## Post-v1 — Code review pass (8-angle multi-agent review, fixes applied)

- Fixed: double-completion double-counting (status guard on the open→done update); lost-points failure now surfaces an honest "completed, but points didn't record" toast instead of failing the mutation.
- Fixed: scoring store resolved auth from a stale module-level cache — now resolves the session at insert time (deleted the side-channel listener).
- Fixed: React Query cache now cleared on sign-out (cross-user cache leak on a shared tab).
- Fixed: idea promotion compensates (deletes the created action) if the idea write fails — no more orphaned boosted actions on retry.
- Fixed: weekly totals cache key now includes the week; vault ideas with a missing resurface date now count as due (nothing can rest forever); waitlist form shows a clear message instead of a raw fetch error when Supabase env is missing.
- UX: removed the raw rank number from action rows (it used a different scale than completion points and read as a bug); ranking reasons remain visible.
- Cleanup: shared `LeverageSelect` + `CategoryInput` components (three drifted copies unified), `useKnownCategories` hook (Ideas page no longer fetches the full actions table for autocomplete), deleted the unmounted legacy shadcn toast stack, removed `lovable-tagger`, removed dead `providerIds` getter, landing footer close aligned with brand guardrails, committed PLAN.md for the record.

### Decisions (approved or per default rules)

- Kept the Vite + React + shadcn scaffold instead of the spec's Next.js — approved by Lea (simpler; nothing in v1 needs SSR).
- Auth is email/password only — avoids the Google OAuth consent-screen hard stop.
- Domain types are hand-maintained in `src/types/domain.ts` (no live project for codegen yet).
- `waitlist_signups` RLS: insert-only for anon/authenticated, no read policy — signups are write-only from the client.
- Vault resurface interval fixed at 30 days (constant in `src/lib/vault.ts`) — "periodically" wasn't specified; simplest honest reading. Easy to make configurable later.
- Archived ideas are hidden but kept in the DB (no hard delete) so the vault's history stays available for v2 reflection features.

## Post-v1 — Live e2e attempt + scripted harness (2026-07-04)

- Attempted the live e2e pass against the real Supabase project; still blocked — the environment's egress gateway returns 403 (policy denial) for `*.supabase.co` while control hosts connect fine. Details logged in BLOCKERS.md.
- Added `npm run e2e:live` (`scripts/live-e2e.mjs`, Playwright): one command runs the full pass — auth → create → complete → totals → reload persistence → anonymous waitlist — against the production build in headless Chromium, with connectivity preflight, proxy awareness for sandboxes, and post-run cleanup of test rows. Harness plumbing verified here via its `E2E_UI_SMOKE=1` mode (build + serve + browser + logged-out pages) and the preflight path (clean exit 2 with the blocker message).
- Follow-up (same day): re-tested — egress still 403s the Supabase host (same container; policy changes likely need a fresh session). Docker daemon unavailable, so no local Supabase stack; instead added `scripts/mock-supabase.mjs` (in-memory GoTrue + PostgREST stand-in with token-scoped rows and the waitlist unique-email conflict) and an `E2E_MOCK=1` mode. Full pass now green locally through the real UI: auth → create → complete (+3 toast) → totals → reload persistence → anonymous waitlist, zero console errors, cleanup included. Fixed one harness bug it caught (success toast is also an `<li>` matching the action title). Remaining live-run risk is only the hosted side: schema/RLS, email-confirmation setting, reachability.
