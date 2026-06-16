-- Polypreneur OS — v1 schema (§7 of the spec).
--
-- The single most important structural decision: checkin, habit_log, and
-- activity all share a `date` axis (DATE type, indexed). That shared axis is
-- what makes the v2 Inner Telemetry correlation engine a query rather than a
-- rebuild. DO NOT remove it. Check-ins relate to "ventures touched that day"
-- by joining on `date` through `activity` — there is intentionally no direct
-- checkin -> venture foreign key.
--
-- v1 is single-user with no auth (§3, §10). Row-level security and a user_id
-- column are deliberately omitted; they belong to the v3 multi-tenant phase.

create extension if not exists "pgcrypto";

-- venture --------------------------------------------------------------------
create table if not exists venture (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  status      text not null default 'experiment'
              check (status in ('primary', 'experiment', 'vault', 'dormant')),
  created_at  timestamptz not null default now()
);

-- checkin (shared date axis) -------------------------------------------------
create table if not exists checkin (
  id               uuid primary key default gen_random_uuid(),
  date             date not null,
  emotional_state  text not null default '',
  energy_level     int  not null default 3 check (energy_level between 1 and 5),
  free_text        text not null default '',
  content_flag     boolean not null default false
);
create index if not exists checkin_date_idx on checkin (date);

-- habit ----------------------------------------------------------------------
create table if not exists habit (
  id      uuid primary key default gen_random_uuid(),
  name    text not null,
  target  text not null default ''
);

-- habit_log (shared date axis) -----------------------------------------------
create table if not exists habit_log (
  id        uuid primary key default gen_random_uuid(),
  habit_id  uuid not null references habit (id) on delete cascade,
  date      date not null,
  value     text not null default ''
);
create index if not exists habit_log_date_idx on habit_log (date);
create index if not exists habit_log_habit_idx on habit_log (habit_id);

-- activity (shared date axis) ------------------------------------------------
create table if not exists activity (
  id          uuid primary key default gen_random_uuid(),
  venture_id  uuid not null references venture (id) on delete cascade,
  date        date not null,
  type        text not null default 'manual'
              check (type in ('commit', 'content_shipped', 'calendar_time', 'manual')),
  source      text not null default 'manual',
  magnitude   numeric not null default 1
);
create index if not exists activity_date_idx on activity (date);
create index if not exists activity_venture_idx on activity (venture_id);

-- task -----------------------------------------------------------------------
-- work_type is a v1 extension beyond §7's minimum, required to compute the
-- §6.2 "energy fit" component (deep-work vs admin against today's energy).
create table if not exists task (
  id             uuid primary key default gen_random_uuid(),
  venture_id     uuid not null references venture (id) on delete cascade,
  title          text not null,
  inversion_tag  text not null default 'execution'
                 check (inversion_tag in ('execution', 'judgment')),
  status         text not null default 'todo'
                 check (status in ('todo', 'in_progress', 'done')),
  work_type      text not null default 'other'
                 check (work_type in ('deep_work', 'admin', 'creative', 'other')),
  due_date       date,
  leverage_score numeric
);
create index if not exists task_venture_idx on task (venture_id);

-- agent_job (this table IS the job queue in v1 — §5.2, §9) --------------------
create table if not exists agent_job (
  id            uuid primary key default gen_random_uuid(),
  agent         text not null default 'scribe',
  input_ref     text not null default '',
  input_text    text not null default '',
  output        text not null default '',
  edited_output text,
  status        text not null default 'pending'
                check (status in ('pending', 'awaiting_approval', 'approved', 'rejected')),
  error         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists agent_job_status_idx on agent_job (status);

-- idea -----------------------------------------------------------------------
create table if not exists idea (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  note         text not null default '',
  captured_at  timestamptz not null default now(),
  status       text not null default 'vault'
               check (status in ('vault', 'promoted'))
);

-- app_setting (operator-owned key/value: weight overrides, cadence, pinned move)
create table if not exists app_setting (
  key    text primary key,
  value  text not null default '{}'
);
