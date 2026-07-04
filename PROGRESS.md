# Progress

Build log for Polypreneur OS v1 (spec: `polypreneur-os-fable5-spec.md`). One or two lines per commit, newest last.

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

### Decisions (approved or per default rules)

- Kept the Vite + React + shadcn scaffold instead of the spec's Next.js — approved by Lea (simpler; nothing in v1 needs SSR).
- Auth is email/password only — avoids the Google OAuth consent-screen hard stop.
- Domain types are hand-maintained in `src/types/domain.ts` (no live project for codegen yet).
- `waitlist_signups` RLS: insert-only for anon/authenticated, no read policy — signups are write-only from the client.
