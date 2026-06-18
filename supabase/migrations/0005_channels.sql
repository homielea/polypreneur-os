-- Close the per-project / per-channel gaps and generalize distribution into a
-- connection model (the operator surface; real multi-network delivery is a
-- future single adapter, e.g. self-hosted Postiz — NOT 15 integrations here).

-- 1. Content -> venture link. Scribe/Repurposer jobs can belong to a venture so
--    distribution and the Analyst become project-scoped. Nullable: not all
--    content (a raw check-in) is venture-specific.
alter table agent_job
  add column if not exists venture_id uuid references venture (id) on delete set null;

-- 2. Channel connections — a configured account on a platform, optionally scoped
--    to a venture. `status` is mostly `placeholder` in v1 (the look + routing,
--    without the real OAuth). `adapter` records how a send is actually performed.
create table if not exists channel_connection (
  id            uuid primary key default gen_random_uuid(),
  venture_id    uuid references venture (id) on delete cascade,  -- null = global
  platform      text not null,        -- beehiiv / substack / x / linkedin / ...
  display_name  text not null default '',
  handle        text not null default '',
  status        text not null default 'placeholder'
                check (status in ('connected', 'placeholder', 'disabled')),
  created_at    timestamptz not null default now()
);
create index if not exists channel_connection_venture_idx on channel_connection (venture_id);

-- 3. Generalize publications from a fixed enum to any platform + an optional
--    connection reference. Drop the old channel check; store the platform string.
alter table publication
  drop constraint if exists publication_channel_check;

alter table publication
  add column if not exists channel_connection_id uuid
  references channel_connection (id) on delete set null;
