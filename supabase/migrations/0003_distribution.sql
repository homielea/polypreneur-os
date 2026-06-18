-- Marketing distribution: getting approved content OUT, through an
-- approval-gated, env-gated write path.
--
-- A `publication` is a record of a publish intent for one approved agent_job to
-- one channel. v1 channels: `manual` (mark-as-exported; always works) and
-- `beehiiv` (newsletter; write integration, env-gated). `social` is reserved.
--
-- Outbound actions are hard to reverse, so the operator initiates every
-- publication and Beehiiv posts are created as DRAFTS — the final send stays a
-- human step in Beehiiv. Judgment stays human, especially at the boundary.

create table if not exists publication (
  id             uuid primary key default gen_random_uuid(),
  job_id         uuid not null references agent_job (id) on delete cascade,
  channel        text not null
                 check (channel in ('manual', 'beehiiv', 'social')),
  status         text not null default 'scheduled'
                 check (status in ('scheduled', 'published', 'failed', 'canceled')),
  scheduled_for  timestamptz,
  external_ref   text,
  error          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists publication_job_idx on publication (job_id);
create index if not exists publication_status_idx on publication (status);
