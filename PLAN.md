# Polypreneur OS v1 — Build Plan

> Status: APPROVED by Lea in-session (2026-07-04, "approved as recommended") before implementation began.
> The spec's autonomous-mode instruction to commit this file before coding was superseded by the
> supervised working mode (plan proposed and approved in chat); committed here afterwards for the record.

## Approved decisions

1. **Stack: Vite + React + shadcn (not the spec's Next.js).** The repo was a working Vite scaffold; nothing in v1 needs SSR. Approved explicitly.
2. **Purge legacy Lovable features**, keep `src/components/ui` primitives.
3. **Auth: Supabase email + password** — avoids the Google OAuth consent-screen hard stop.
4. **Supabase credentials via env vars**; project created and migration run by Lea (hard-stop item, resolved).
5. **Marketing plugins unavailable** — landing copy written directly from `.agents/product-marketing-context.md`.

## Build order (one feature per commit + checkpoint)

1. App shell + auth + Supabase schema (all five tables + RLS up front)
2. Highest-Leverage Home Screen + scoring engine as a standalone pluggable service
3. Great Inversion Ledger with global quick-capture
4. 80/20 Enforcer + Idea Vault with resurfacing
5. Landing page + waitlist

## Data model

Postgres, every user table `user_id`-scoped with RLS:

- `actions` — title, notes, category, leverage 1–5, status open|done, source manual|idea_promotion
- `score_events` — additive only (`points > 0` CHECK), category, source, optional action FK
- `ledger_entries` — situation, judgment, outcome, tags[]
- `ideas` — content, triage now|vault, status active|promoted|archived, promoted_action_id, next_resurface_at
- `waitlist_signups` — email (unique), anon insert-only

## Scoring engine interface

`src/lib/scoring/` — framework-agnostic core (`engine.ts` has no React/Supabase imports), persistence injected via `ScoreStore`, signals pluggable via `LeverageProvider.registerProvider()`. v1 providers: `manual-leverage`, `top20-boost`. v2's Neglect Radar / Reflection Pipe implement the same interface.
