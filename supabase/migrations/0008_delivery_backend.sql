-- A channel can choose its delivery backend now that there are two aggregators
-- (Blotato + self-hosted Postiz). `auto` resolves to the first configured of
-- [Blotato, Postiz]; pin a channel to route it explicitly.
alter table channel_connection
  add column if not exists delivery_backend text not null default 'auto'
  check (delivery_backend in ('auto', 'blotato', 'postiz', 'mark_posted'));
