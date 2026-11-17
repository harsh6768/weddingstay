-- WeddingStay database. One row per wedding; the app's data lives in `data` (see src/data/types.ts).
create table if not exists weddings (
  id uuid primary key,
  manage_token text not null unique,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Guest links look a wedding up by household id.
create index if not exists weddings_households on weddings using gin ((data -> 'households') jsonb_path_ops);
-- Only the server's own database role may touch this table, never the public Supabase API.
alter table weddings enable row level security;
-- The server logs in as `weddingstay_api` (created once with a password, outside this file:
--   create role weddingstay_api login password '...';) and gets only what it needs.
drop policy if exists server_all on weddings;
create policy server_all on weddings to weddingstay_api using (true) with check (true);
grant usage on schema public to weddingstay_api;
grant select, insert, update on weddings to weddingstay_api;
revoke all on weddings from anon, authenticated; -- Supabase's public API roles
