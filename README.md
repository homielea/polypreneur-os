# Polypreneur OS — v1

A single-user cockpit for one operator running many ventures: **a judgment layer
for the human, an execution layer for AI agents.** The human decides what has the
highest leverage today; agents do the work and report back for approval.

This is the v1 dogfood release (see `polypreneur-os-spec-v1.md`).

## Stack

- **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui** — the cockpit.
- **Supabase (Postgres)** — the §7 data model, as SQL migrations. When Supabase
  isn't configured the app falls back to a local JSON store so it runs end-to-end
  for review.
- **The Scribe** on **Claude** (`@anthropic-ai/sdk`) — the one live agent.
- **Job queue = the `agent_job` table** (no external queue).
- **Read integrations:** Notion, Google Calendar, GitHub (leaos-hq). Gmail /
  Beehiiv / vidIQ are stubbed. Voice notes = audio dropped in a watched Google
  Drive folder.

Every external dependency is **optional and env-gated**: with no credentials the
app runs on a seeded local store with stubbed integrations and a local Scribe
stub. Add credentials to light up the real backends — no code change.

## Run it

```sh
npm install
npm run dev          # http://localhost:3000  (auto-seeds .data/store.json)
```

Optional, to use real backends, copy `.env.example` to `.env.local` and fill in
what you have. Then:

```sh
npm run db:migrate   # apply supabase/migrations (needs SUPABASE_DB_URL or the Supabase CLI)
npm run db:seed      # load sample data into Supabase (app must be running)
npm run scribe:scan  # scan the Drive folder + content-flagged check-ins -> jobs
```

## The screens

- **Today** — the one job: *"What is my single highest-leverage move today?"* A
  transparent additive score (§6.2) with the full per-component breakdown. The
  hero is your own (judgment) move; high-scoring execution work gets a *delegate*
  nudge. Ranking is inspectable and overridable (pin any task).
- **Inversion Ledger** — execution-vs-judgment ratio, a daily-snapshot trend, and
  inline tagging.
- **Inner Life OS** — daily check-in + operator-editable habits, and "ventures
  touched today" derived by joining activity to the check-in on the shared date
  axis (the v2 correlation hook).
- **Ventures** — the 80/20 Enforcer: focus caps (2 primary + 1 experiment); the
  system says no by design.
- **Idea Vault** — capture, and promote-to-venture (cap-enforced).
- **Approval Inbox** — every agent draft lands here; nothing ships without your
  approval. Approved Lea's Lessons can be **repurposed** (Repurposer agent →
  short-form script, newsletter section, social posts — each its own approval).
- **Distribution** — Postiz-style: per-venture **channel connections**, a
  multi-channel composer from approved content, and a scheduled timeline.
  Channels are placeholders in v1 (the operator surface + routing); `beehiiv`
  creates a real *draft*, others are "mark as posted". Publish now or schedule.
- **Settings** — leverage weights, Scribe cadence, integration status + sync.

## Beyond the v1 spec (built in this branch)

- **Voice-note transcription** — audio dropped in the Drive folder is transcribed
  to text (Google Speech-to-Text, reusing the Google service account) and fed to
  the Scribe. Swappable behind one adapter; the agents stay on Claude.
- **The Repurposer** — the second agent, proving the rails generalize: one
  approved piece → derivative formats, each approval-gated. Operator-triggered in
  v1 (the human is the router); v2 can auto-chain.
- **Marketing distribution** — per-venture channel connections (Beehiiv,
  Substack, X, LinkedIn, Instagram, …), a multi-channel composer, and a
  scheduled outbox. Delivery is a swappable backend behind one interface
  (`src/lib/content-engine/delivery`): **Blotato** is the wired multi-network
  send adapter (env-gated; social/video deliver live when `BLOTATO_API_KEY` is
  set, "mark as posted" otherwise), Beehiiv does real newsletter drafts, and
  self-hosted **Postiz** is the intended OSS backend for the extracted product.
  Content is linked to a venture, so distribution and the Analyst are
  project-scoped. See `src/lib/content-engine/README.md` for the extraction plan.
- **Faceless video (Studio)** — the Producer agent turns an approved piece into a
  video package (title, voiceover script, scene/b-roll plan, thumbnail concept);
  you approve before render/distribute; rendering is a **pluggable backend
  registry** — **HeyGen (avatar/UGC) is wired** (async submit→poll; needs
  `HEYGEN_API_KEY` + `HEYGEN_AVATAR_ID` + `HEYGEN_VOICE_ID`), with Veo3 / Runway /
  Blotato scaffolded and a stub fallback; approved videos publish via the Blotato
  media path.
- **Extractable content engine** — `src/lib/content-engine` now depends only on
  ports (`StorePort` / `LlmPort` / `EngineConfig`); the host wires them in
  `src/lib/engine.ts`. The engine has no venture/db/env/SDK imports, so it can be
  lifted into its own package. "Project" is generic (PP-OS binds project=venture).
  See `src/lib/content-engine/README.md`.
- **The Analyst** — transparent, rule-based signals: per-venture momentum (7d vs
  prior 7d), a neglect radar ("going cold" before a venture dies, also surfaced
  on Today), and content-performance metrics (Beehiiv ingest; seeded otherwise).
  Surfaces signals for the operator to judge — not the inner-state correlation
  engine (still later; this is collect-and-surface, no black box).

## Architecture notes

- `src/config/leverage.config.ts` is the canonical, editable home for the §6.2
  weights; the UI overrides persist in `app_setting` and fall back to the file.
- `src/lib/db` is an env-gated repository: Supabase when configured, else a local
  JSON store. Route handlers never import a backend directly.
- `src/lib/leverage/score.ts` implements the exact additive model with a full
  component breakdown — no black box.
- `src/lib/agents/scribe` is the source → agent → draft → human-approval loop.
- The Vite/localStorage prototype this repo started from is archived under
  `legacy/`.

## Out of scope for v1 (§10)

Multi-tenant/auth, agent-to-agent coordination, the correlation engine, more than
one live agent, auto-tagging, the autonomy dial. The schema is instrumented for
them; they don't ship in v1.
