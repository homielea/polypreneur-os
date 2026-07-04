-- Polypreneur OS v1 — initial schema
-- Tables: actions, score_events, ledger_entries, ideas, waitlist_signups
-- All user data is user_id-scoped with RLS. waitlist_signups allows anon inserts only.

-- ============ actions ============
create table public.actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text not null default '',
  category text not null default 'general',
  leverage smallint not null default 3 check (leverage between 1 and 5),
  status text not null default 'open' check (status in ('open', 'done')),
  source text not null default 'manual' check (source in ('manual', 'idea_promotion')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.actions enable row level security;

create policy "own actions" on public.actions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ score_events (additive only: points > 0) ============
create table public.score_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action_id uuid references public.actions (id) on delete set null,
  source text not null default 'completion',
  category text not null default 'general',
  points integer not null check (points > 0),
  created_at timestamptz not null default now()
);

alter table public.score_events enable row level security;

create policy "own score events" on public.score_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ ledger_entries (Great Inversion Ledger) ============
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  situation text not null,
  judgment text not null,
  outcome text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.ledger_entries enable row level security;

create policy "own ledger entries" on public.ledger_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ ideas (80/20 Enforcer / Idea Vault) ============
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  triage text not null check (triage in ('now', 'vault')),
  status text not null default 'active' check (status in ('active', 'promoted', 'archived')),
  promoted_action_id uuid references public.actions (id) on delete set null,
  next_resurface_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ideas enable row level security;

create policy "own ideas" on public.ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ waitlist_signups (landing page) ============
create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.waitlist_signups enable row level security;

-- Anyone (anon) may sign up; nobody may read/update/delete via the API.
create policy "anon can sign up" on public.waitlist_signups
  for insert to anon, authenticated with check (true);

-- ============ indexes ============
create index actions_user_status_idx on public.actions (user_id, status);
create index score_events_user_created_idx on public.score_events (user_id, created_at);
create index ledger_entries_user_created_idx on public.ledger_entries (user_id, created_at desc);
create index ideas_user_status_idx on public.ideas (user_id, status);
create index ideas_resurface_idx on public.ideas (user_id, next_resurface_at) where status = 'active' and triage = 'vault';
