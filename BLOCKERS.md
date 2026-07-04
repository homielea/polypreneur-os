# Blockers

## Open

- **Remote build environment can't reach `*.supabase.co` (network policy).** Credentials are in place, but the sandbox's gateway rejects connections to the Supabase project, so live end-to-end verification (auth → create → complete → totals) can't run from the build container — only typecheck/lint/tests/build + logged-out UI smoke tests. Works fine on a normal machine. Fix if desired: allow `*.supabase.co` in this environment's network settings on claude.ai/code, then ask for a live verification pass.
  - *2026-07-04: retried — still blocked.* The egress gateway answers 403 (policy denial) for `cfkkziueoloewbftuunh.supabase.co` and `supabase.com`; control hosts like `github.com` connect fine, so it's the allowlist, not the network. Note: environment network-setting changes may only apply to sessions started *after* the change.
  - The whole pass is now scripted: **`npm run e2e:live`** (`scripts/live-e2e.mjs`) drives the real UI in headless Chromium against the production build — signup/signin → create action → complete (+points toast) → weekly totals → reload persistence → anonymous waitlist signup — then cleans up its test rows. It preflights connectivity (exit 2 with this blocker's message while the policy still blocks) and is proxy-aware for sandboxed environments. If the Supabase project has "Confirm email" enabled, run it with `E2E_EMAIL`/`E2E_PASSWORD` set to an existing confirmed account.
- **`marketing-skills` / `superpowers` plugins are not installed in this environment** (spec assumes they are). Landing-page copy (build step 5) will be written directly from `.agents/product-marketing-context.md` following its guardrails instead of via the `copywriting` / `page-cro` skills.

## Resolved

- **Supabase project + credentials** — Lea created the project, ran `0001_init.sql`, and provided the URL + anon key (2026-07-04). Note: they were committed in `.env.example`; the anon key is designed to be public so this is acceptable, and `.env` is now gitignored for local use.
