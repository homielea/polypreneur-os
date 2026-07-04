# Polypreneur OS — v1 Build Spec (Claude Fable 5 Kickoff)

## Context to give Fable 5 up front

You are building **Polypreneur OS**, a personal operating dashboard for Lea — a solopreneur running multiple ventures in parallel (coaching, content, retreats, apps) with ADHD-informed workflow design. The core philosophy: rhythm over schedule, 80/20 focus, additive scoring instead of gamified pressure. The underlying intellectual thesis running through the product and its marketing is **The Great Inversion**: AI commoditizes execution, human judgment becomes the scarce, valuable layer.

Repo: `leaos-hq` org, Polypreneur OS project. Stack: Next.js, Tailwind, Supabase/Postgres. Agent model for v1 is **non-autonomous** — a single "Scribe" agent that logs/reflects, no autonomous decision-making agents yet.

Marketing skills (`marketing-skills` plugin) and dev workflow skills (`superpowers` plugin) are installed in this repo. Brand/voice context lives at `.agents/product-marketing-context.md` — read it before writing any copy. Use `copywriting` and `page-cro` skills for the landing page; use `brainstorming` and `writing-plans` skills before you start implementation, and `test-driven-development` + `verification-before-completion` throughout.

## Scope for this build (v1 — do not exceed)

Three features only. Each should be genuinely functional, not a stub.

### 1. Highest-Leverage Home Screen
- Single entry-point view showing the day/week's highest-leverage actions
- Additive scoring engine: actions accumulate points across categories (not deducted, not gamified with streak pressure) — reflect Lea's anti-gamification stance
- Score inputs should be pluggable, since Neglect Radar and Reflection Pipe will feed into this engine in v2 — design the scoring module as a service other features can call, not hardcoded into the home screen component

### 2. Great Inversion Ledger
- A running log where Lea records moments where judgment/human discernment created value AI execution couldn't
- Structured entry: situation, judgment applied, outcome — timestamped
- Should be simple to add an entry from anywhere in the app (quick-capture, not a form buried in a menu — respect ADHD friction sensitivity)
- Entries should be taggable so they can later feed the Reflection → Content Pipe (v2) for newsletter/script material

### 3. 80/20 Enforcer / Idea Vault
- Quick-capture for ideas with a forced triage step: is this in the top 20% of leverage right now, or does it go to the vault?
- Vault is not a graveyard — items should resurface periodically for re-evaluation, not disappear
- No due dates or streaks; this should reduce pressure, not add it

## Landing page

Build a simple, single-page marketing site for Polypreneur OS using the `copywriting` and `page-cro` skills, reading `.agents/product-marketing-context.md` for voice. Positioning: a system for people running multiple ventures in parallel, built by someone doing it herself. Include: hero, problem/positioning, the three v1 features as proof points, simple waitlist/signup capture. No pricing yet — this is pre-launch.

## What NOT to build yet
Neglect Radar, Reflection → Content Pipe, any autonomous agent behavior beyond Scribe logging, pricing/billing, multi-user support.

## Working mode: fully autonomous, overnight, no human available

No one will be reviewing checkpoints or answering questions during this run. Do not pause and wait for input at any point — if you hit a decision point, resolve it yourself using the default rules below, log the decision, and keep going.

**Startup sequence (do this before writing any app code):**
1. Run `brainstorming` and `writing-plans` skills to produce a full implementation plan for the 3 features + landing page.
2. Commit the plan as `PLAN.md` in the repo root before touching implementation.

**Default rules for ambiguity (use these instead of asking):**
- When a design choice isn't specified in this spec, choose the simpler/smaller option — this is v1, not the final architecture.
- When in doubt about UI polish vs. functional correctness, prioritize functional correctness. Rough-but-working beats polished-but-broken.
- If a feature's scope threatens to expand beyond what's written here, cut it back to spec rather than build the fuller version.
- If something is genuinely blocked (missing credential, external service down, contradictory requirement), do not stall: log it clearly in `BLOCKERS.md` with what you tried, skip that piece, and continue with everything else that's unblocked.

**Self-checkpointing (replaces human checkpoints):**
- Commit to git after: the plan, each of the 3 features individually, and the landing page. Small, working commits — not one giant commit at the end.
- After each feature, run its tests (TDD per `test-driven-development` skill) and run `verification-before-completion` before moving to the next feature. Do not mark anything done that doesn't actually run.
- Keep a running `PROGRESS.md` — one or two lines per commit — so the state of the build is legible to Lea in the morning without her having to read the whole session.

**Hard stop conditions (these ARE worth halting for):**
- Anything requiring a real payment/billing integration — this is pre-launch, no billing in v1.
- Anything requiring credentials or API keys not already present in the repo/environment.
- Anything that would touch production data or a live user-facing deployment.
If one of these comes up, stop that specific piece, log it in `BLOCKERS.md`, and continue with the rest of the scope.

**End of run:** finish with a top-level summary in `PROGRESS.md` — what's done, what's in `BLOCKERS.md`, and what you'd do next if the session continued.
