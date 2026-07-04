# Progress

Build log for Polypreneur OS v1 (spec: `polypreneur-os-fable5-spec.md`). One or two lines per commit, newest last.

## Feature 1 — App shell + auth + Supabase schema

- Committed the v1 spec and brand context (`.agents/product-marketing-context.md`) into the repo.
- Purged legacy Lovable feature components (Kanban, voice input, canvases, template library, old pages); kept shadcn `ui/` primitives, `ErrorBoundary`, `NotFound`.
- Added Supabase: `@supabase/supabase-js`, client in `src/lib/supabase.ts`, `.env.example`, and full v1 schema with RLS in `supabase/migrations/0001_init.sql` (actions, score_events, ledger_entries, ideas, waitlist_signups).
- Auth: email/password via `AuthContext`, `/login` page with signin/signup toggle, protected `/app` routes.
- App shell: responsive sidebar layout with Today / Ledger / Ideas nav; placeholder pages for features 2–4.

### Decisions (approved or per default rules)

- Kept the Vite + React + shadcn scaffold instead of the spec's Next.js — approved by Lea (simpler; nothing in v1 needs SSR).
- Auth is email/password only — avoids the Google OAuth consent-screen hard stop.
- Domain types are hand-maintained in `src/types/domain.ts` (no live project for codegen yet).
- `waitlist_signups` RLS: insert-only for anon/authenticated, no read policy — signups are write-only from the client.
