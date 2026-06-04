# Spec: Polypreneur OS

> Status: **DRAFT** — awaiting human review before Phase 2 (Plan).
> Owner: @homielea
> Last updated: 2026-06-04

## 1. Objective

A personal command center for one solopreneur juggling multiple ventures. Single user, single tenant. The product answers one question on every visit:

> **"Across all my projects, where should I spend the next hour?"**

Everything else (idea capture, canvases, daily check-ins, analytics) exists to make that answer better, faster, and more honest.

### User story

> As a solopreneur with N active ventures, when I open polypreneur-os each morning I see every project on one screen — its stage, momentum, what's blocked, and what the data says I should touch today — so I stop randomly switching and start compounding.

### Non-goals (v1)

- Multi-user / teams / sharing
- Public publishing or client-facing views
- Mobile-native app (responsive web is enough)
- Replacing existing tools (Notion, Linear, GitHub) — this is the **meta-layer above them**
- AI agents that take actions autonomously

## 2. Success criteria

The MVP is done when:

1. I can register ≥3 projects (with stage, type, status, north-star metric) and see them all on a single Portfolio screen.
2. Portfolio screen shows per-project: stage, last activity timestamp, current blocker (if any), momentum score, and a single recommended next action.
3. Data persists to Supabase and survives logout / device switch. No data loss when localStorage is cleared.
4. I can drill into a project, edit its fields inline, log a daily check-in (mood + energy + focus project), and see a 14-day trend chart.
5. AI assistant can answer "what should I work on right now?" with reasoning grounded in *my actual data* (stages, last-activity, energy, current blockers) — not generic advice.
6. Page-load to interactive Portfolio view < 2s on broadband; no layout shift (CLS < 0.1).
7. I use it for 7 consecutive days without falling back to a spreadsheet. (Honest dogfooding gate.)

## 3. Tech stack

**Keeping (audit confirmed):**

- Vite + React 18 + TypeScript 5
- Tailwind CSS 3 + shadcn/ui (Radix primitives)
- React Router 6
- React Hook Form + Zod (already installed, will actually use now)
- Recharts (analytics)
- Lucide icons, Sonner toasts, date-fns

**Adding:**

- **Supabase** — Postgres + Auth + Row-Level Security. Single-user but RLS still on (user_id scoping) so future multi-tenant is just a config flip.
- **TanStack Query** — already installed, currently unused. Becomes the data-fetching layer over Supabase.
- **Anthropic SDK** (`@anthropic-ai/sdk`) — for the AI assistant. Calls go through a Supabase Edge Function so the API key never reaches the browser.

**Removing:**

- All localStorage state sync code in `Index.tsx`
- `VoiceProjectCreator`, `useVoiceRecognition`, `KanbanBoard`, `KeyboardShortcuts`, `TouchOptimizedButton`, `OnboardingWizard`, `TemplateLibrary`, `AnimatedCard`, `EnhancedLoadingSpinner`, standalone `StrategyLibrary` page
- `AIAssistantPanel` as a UI stub — replaced with a real, data-grounded assistant

## 4. Commands

```
Install:     bun install
Dev:         bun run dev          # vite, port 8080
Build:       bun run build
Lint:        bun run lint
Typecheck:   bun run typecheck    # to be added — tsc --noEmit
Test:        bun run test          # to be added — vitest
DB:          bunx supabase start  # local Supabase via Docker
```

## 5. Project structure

```
src/
  pages/
    Portfolio.tsx          # (renamed from Index.tsx) the home view
    ProjectWorkspace.tsx   # single-project drilldown
    Login.tsx              # Supabase auth
  components/
    portfolio/             # Portfolio-specific widgets
      ProjectCard.tsx
      MomentumIndicator.tsx
      NextActionCard.tsx
    project/               # Workspace-specific widgets
      ProjectHeader.tsx
      PhaseChecklist.tsx
      StrategyDrawer.tsx   # Lean / SWOT / BMC live here as drawers, not pages
    ideas/
      IdeaVaultGrid.tsx
      IdeaCaptureSheet.tsx # bottom sheet — capture in <15s
    checkin/
      DailyCheckIn.tsx
      EveningReflection.tsx
    ai/
      AssistantSheet.tsx   # right-side panel, opens with Cmd+K
    ui/                    # shadcn primitives (existing)
  hooks/
    useProjects.ts         # TanStack Query wrappers
    useIdeas.ts
    useCheckins.ts
    useAssistant.ts
  lib/
    supabase.ts            # client singleton
    momentum.ts            # pure: computes per-project momentum score
    scoring.ts             # pure: idea scoring heuristics
  types/
    db.ts                  # generated from Supabase schema
    domain.ts              # Project, Idea, CheckIn — app-facing types
supabase/
  migrations/              # SQL migrations, version controlled
  functions/
    assistant/             # Edge Function for AI calls
docs/
  spec.md                  # this file
  adr/                     # Architecture Decision Records
tests/
  unit/                    # vitest, co-located OK too
  integration/             # supabase-js against local Supabase
```

## 6. Data model (Supabase / Postgres)

```sql
projects (
  id uuid pk,
  user_id uuid fk auth.users,
  title text not null,
  type text check (type in ('web-app','extension','mobile','content','service','other')),
  status text check (status in ('ideation','in-progress','ready-to-launch','launched','paused','killed')),
  stage_index int default 0,          -- index into phase template
  north_star_metric text,             -- e.g. "weekly active users"
  north_star_value numeric,
  north_star_target numeric,
  last_activity_at timestamptz,
  current_blocker text,
  energy_fit_min int default 1,       -- 1-5, what energy level this work needs
  created_at timestamptz default now()
)

ideas (
  id uuid pk,
  user_id uuid fk,
  title text not null,
  description text,
  category text,
  pmf_score int, portfolio_fit_score int, launch_speed_score int, ai_priority_score int,
  energy_level int,
  status text check (status in ('raw','validated','promoted','archived')),
  promoted_to_project_id uuid fk projects nullable,
  created_at timestamptz default now()
)

daily_checkins (
  id uuid pk,
  user_id uuid fk,
  date date not null,
  mood int, energy int, focus int,    -- 1-5 each
  focus_project_id uuid fk projects nullable,
  intentions text,
  created_at timestamptz default now(),
  unique (user_id, date)
)

evening_reflections (
  id uuid pk,
  user_id uuid fk,
  date date not null,
  satisfaction int, completion int,   -- 1-5
  what_worked text, what_blocked text,
  unique (user_id, date)
)

project_phases (
  id uuid pk,
  project_id uuid fk projects,
  name text, completed bool, order_index int,
  -- per-project override of the default 13-phase template
)

project_strategy (
  project_id uuid pk fk projects,
  lean_canvas jsonb, swot jsonb, bmc jsonb, personas jsonb
)
```

All tables have RLS policies: `user_id = auth.uid()`. Even single-tenant, RLS is on from day one.

## 7. Code style

One snippet beats five paragraphs:

```tsx
// src/components/portfolio/ProjectCard.tsx
import { Card } from "@/components/ui/card";
import { MomentumIndicator } from "./MomentumIndicator";
import type { Project } from "@/types/domain";

type Props = {
  project: Project;
  onOpen: (id: string) => void;
};

export function ProjectCard({ project, onOpen }: Props) {
  return (
    <Card
      onClick={() => onOpen(project.id)}
      className="cursor-pointer p-4 hover:bg-muted/40 transition"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{project.title}</h3>
          <p className="text-xs text-muted-foreground">{project.status}</p>
        </div>
        <MomentumIndicator score={project.momentum} />
      </div>

      {project.currentBlocker && (
        <p className="mt-2 text-sm text-amber-600">
          Blocked: {project.currentBlocker}
        </p>
      )}
    </Card>
  );
}
```

**Conventions:**

- Components: `PascalCase.tsx`, one default-or-named component per file. Co-locate small subcomponents.
- Types: `PascalCase`. Domain types in `src/types/domain.ts`; DB types generated to `src/types/db.ts`.
- Hooks: `useFoo`, return `{ data, isLoading, error, mutate }` — TanStack-Query shape, not raw fetch.
- No default exports for components except pages.
- No barrel `index.ts` files — explicit imports.
- Tailwind classes ordered: layout → spacing → typography → color → state. Use `cn()` helper for conditionals.
- No comments explaining *what* the code does. Only *why*, and only when non-obvious.
- Server calls only through TanStack hooks in `src/hooks/`. Components don't touch Supabase directly.

## 8. Testing strategy

- **Vitest** for unit tests. Co-locate as `Foo.test.ts` next to `Foo.ts` for pure functions; `tests/integration/` for anything that hits Supabase.
- **What we test:**
  - Pure functions in `lib/` (momentum, scoring) — 100% coverage, table-driven cases.
  - Hooks — mocked supabase client, verify query shape and error paths.
  - Components — only the ones with non-trivial logic (PortfolioGrid filtering, NextActionCard ranking). Skip dumb display components.
  - One end-to-end happy path via Playwright in CI: log in → create project → log check-in → see updated momentum. (Phase 3, not v1.)
- **Coverage target:** 80% on `lib/` and `hooks/`, no target on components.
- **What we don't test:** shadcn UI primitives, generated DB types, third-party libs.

## 9. Boundaries

**Always do:**

- Run `lint` and `typecheck` before commit
- Use RLS policies on every new table
- Wrap Supabase calls in TanStack Query hooks
- Use Zod schemas for any external/AI-returned data
- Update this spec when scope shifts; commit spec changes in the same PR as the implementation

**Ask first:**

- Adding a new top-level dependency
- Schema changes (migrations) — preview SQL before running
- Anything that touches auth or RLS
- Architectural changes (state management swap, routing rewrite)
- Calls to paid APIs (estimated cost)

**Never do:**

- Commit `.env` files or API keys
- Edit `src/components/ui/*` (shadcn primitives — regenerate instead)
- Bypass RLS with the service-role key on the client
- Add features not in this spec without updating the spec first

## 10. Architecture decisions (locked)

- **Supabase over custom backend** — auth, db, edge functions, real-time in one. Single-user but no extra cost.
- **TanStack Query as state layer** — already installed, well-fitted, kills the localStorage mess.
- **RLS from day one** — cheap insurance.
- **Edge Functions for AI calls** — keeps API key server-side, lets us swap models without redeploying the SPA.
- **Single-user / single-tenant in v1** — but `user_id` scoping everywhere so we don't paint ourselves into a corner.

## 11. Open questions

These block Phase 2 (Plan). I need answers:

1. **AI provider** — Anthropic Claude (recommended: matches your existing tooling) or OpenAI?
2. **Which 1-2 data integrations for v1?** Candidates, in rough order of leverage:
   - **GitHub** — commit activity → momentum signal per project (highest leverage if your projects are code)
   - **Stripe** — revenue per project → north-star metric auto-populated
   - **Plausible / GA** — traffic per project
   - **Linear / Notion** — open tasks per project
   - Or: skip integrations entirely in v1, manual entry only
3. **Auth flow** — magic link only (simplest, recommended), or Google/GitHub OAuth?
4. **Hosting** — Vercel, Cloudflare Pages, or self-hosted? (Supabase has free tier so we pick whatever's cheapest/fastest.)
5. **Dogfooding commitment** — what's the minimum number of *your real projects* you'll register on day one? This shapes which fields are mandatory vs optional.

---

## Verification checklist (per spec-driven-development skill)

- [x] Spec covers all six core areas (Objective, Commands, Structure, Style, Testing, Boundaries)
- [ ] **Human has reviewed and approved this spec** ← we are here
- [x] Success criteria are specific and testable
- [x] Boundaries (Always/Ask First/Never) are defined
- [x] Spec saved to repository (`docs/spec.md`)

**Next step:** answer the five open questions, then advance to Phase 2 (Plan).
