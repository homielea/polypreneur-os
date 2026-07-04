# Blockers

## Open

- **Supabase project + credentials needed (hard-stop item).** The app is built against `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars and compiles without them, but auth and data can't work until a Supabase project exists. Needed from Lea: create a project at supabase.com, run `supabase/migrations/0001_init.sql` against it (SQL editor or CLI), and provide the URL + anon key for `.env`. Until then, verification of features is limited to typecheck/build/lint + UI smoke test without data.
- **`marketing-skills` / `superpowers` plugins are not installed in this environment** (spec assumes they are). Landing-page copy (build step 5) will be written directly from `.agents/product-marketing-context.md` following its guardrails instead of via the `copywriting` / `page-cro` skills.

## Resolved

- *(none yet)*
