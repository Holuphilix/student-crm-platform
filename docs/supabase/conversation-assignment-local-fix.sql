-- Minimal local development fix for conversation assignment.
-- Run this in Supabase SQL Editor for the project used by frontend/.env and worker/.dev.vars.

alter table public.clients
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table public.conversations
  add column if not exists author_id uuid references auth.users(id) on delete set null;

alter table public.conversations
  add column if not exists assigned_to uuid references auth.users(id) on delete set null;

alter table public.conversations
  add column if not exists status text not null default 'open';

do $$
declare
  conversations_status_constraint_name text;
begin
  select conname
    into conversations_status_constraint_name
  from pg_constraint
  where conrelid = 'public.conversations'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%'
  limit 1;

  if conversations_status_constraint_name is not null then
    execute format(
      'alter table public.conversations drop constraint %I',
      conversations_status_constraint_name
    );
  end if;

  alter table public.conversations
    add constraint conversations_status_check
    check (status in ('open', 'pending', 'closed'));
end $$;

create index if not exists clients_owner_id_idx
  on public.clients(owner_id);

create index if not exists conversations_author_id_idx
  on public.conversations(author_id);

create index if not exists conversations_assigned_to_idx
  on public.conversations(assigned_to);

create index if not exists conversations_status_idx
  on public.conversations(status);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime
      add table public.conversations;
  end if;
end $$;
