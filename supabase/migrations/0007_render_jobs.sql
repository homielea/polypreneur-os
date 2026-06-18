-- HeyGen (and any async render backend) submits a job and returns a job id;
-- the asset URL is fetched by polling. Track the in-flight render job so the
-- operator can refresh until the video is ready.
alter table video_production
  add column if not exists render_job_id text;
