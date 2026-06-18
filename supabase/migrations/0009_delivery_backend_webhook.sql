-- Consolidate delivery backends: replace the Blotato/Postiz aggregators with a
-- single generic webhook to your own pipeline (+ mark-as-posted).
alter table channel_connection
  drop constraint if exists channel_connection_delivery_backend_check;

update channel_connection
  set delivery_backend = 'webhook'
  where delivery_backend in ('blotato', 'postiz');

alter table channel_connection
  add constraint channel_connection_delivery_backend_check
  check (delivery_backend in ('auto', 'webhook', 'mark_posted'));
