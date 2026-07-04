# Blockers

## Open

- **Remote build environment can't reach `*.supabase.co` (network policy).** Credentials are in place, but the sandbox's gateway rejects connections to the Supabase project, so live end-to-end verification (auth → create → complete → totals) can't run from the build container — only typecheck/lint/tests/build + logged-out UI smoke tests. Works fine on a normal machine. Fix if desired: allow `*.supabase.co` in this environment's network settings on claude.ai/code, then ask for a live verification pass.
- **`marketing-skills` / `superpowers` plugins are not installed in this environment** (spec assumes they are). Landing-page copy (build step 5) will be written directly from `.agents/product-marketing-context.md` following its guardrails instead of via the `copywriting` / `page-cro` skills.

## Resolved

- **Supabase project + credentials** — Lea created the project, ran `0001_init.sql`, and provided the URL + anon key (2026-07-04). Note: they were committed in `.env.example`; the anon key is designed to be public so this is acceptable, and `.env` is now gitignored for local use.
