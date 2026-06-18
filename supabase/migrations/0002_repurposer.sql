-- Generalize the agent_job queue beyond the Scribe (still one human-approval
-- gate, still one row = one draft to approve).
--
-- - Allow the `repurposer` agent (turns one approved piece into derivatives).
-- - Add a nullable `format` column for the derivative type. NULL = the Scribe's
--   single canonical draft.

alter table agent_job
  drop constraint if exists agent_job_agent_check;

alter table agent_job
  add constraint agent_job_agent_check
  check (agent in ('scribe', 'repurposer'));

alter table agent_job
  add column if not exists format text
  check (format is null or format in ('short_form_script', 'newsletter_section', 'social_posts'));
