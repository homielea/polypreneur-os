-- The Analyst: a metrics layer for content/venture performance.
--
-- `metric` is a small time series of named KPIs (subscribers, opens, views, …)
-- per venture or account-level. It shares the `date` axis with checkin /
-- habit_log / activity — same "instrument for the future" principle, so the
-- Analyst's content-performance view and (later) the correlation engine are
-- queries, not rebuilds.
--
-- The Analyst is read + transparent compute. It does not act; it surfaces
-- signals (momentum, going-cold, performance) for the operator to judge.

create table if not exists metric (
  id          uuid primary key default gen_random_uuid(),
  venture_id  uuid references venture (id) on delete cascade,  -- null = account-level
  source      text not null
              check (source in ('beehiiv', 'youtube', 'manual')),
  name        text not null,        -- e.g. subscribers / opens / clicks / views
  value       numeric not null,
  date        date not null,        -- shared date axis
  ref         text,                 -- external id (post/video) for idempotent ingest
  created_at  timestamptz not null default now()
);
create index if not exists metric_venture_idx on metric (venture_id);
create index if not exists metric_date_idx on metric (date);
create index if not exists metric_source_name_idx on metric (source, name);
