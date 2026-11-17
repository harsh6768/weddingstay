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

-- Who can manage a wedding besides its private link: the couple and their helpers.
-- A member either signed in with Google (user_id = Supabase Auth's user id, the token's `sub`)
-- or chose not to sign in and opens it with their own personal link (link_token, /h/<token>).
-- side: null = the whole wedding; BRIDE or GROOM = only that side's families (plus families shared by both).
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  user_id uuid,
  link_token text unique,
  name text not null check (length(name) between 1 and 60),
  email text,
  role text not null check (role in ('OWNER', 'HELPER')),
  side text check (side in ('BRIDE', 'GROOM')),
  created_at timestamptz not null default now(),
  unique (wedding_id, user_id),
  check (user_id is not null or (link_token is not null and role = 'HELPER'))
);
create index if not exists members_user on members (user_id);

-- One-time invite links (/join/<code>) the couple sends a helper on WhatsApp.
create table if not exists invites (
  code text primary key,
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null check (length(name) between 1 and 60),
  side text check (side in ('BRIDE', 'GROOM')),
  created_at timestamptz not null default now(),
  used_at timestamptz
);
create index if not exists invites_wedding on invites (wedding_id);

alter table members enable row level security;
alter table invites enable row level security;
drop policy if exists server_all on members;
drop policy if exists server_all on invites;
create policy server_all on members to weddingstay_api using (true) with check (true);
create policy server_all on invites to weddingstay_api using (true) with check (true);
grant select, insert, update, delete on members, invites to weddingstay_api;
revoke all on members, invites from anon, authenticated;
