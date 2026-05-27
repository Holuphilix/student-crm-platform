create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  message text not null,
  sender text not null check (sender in ('client', 'agent')),
  created_at timestamptz not null default now()
);

create index if not exists conversations_client_id_created_at_idx
  on public.conversations (client_id, created_at);

alter table public.conversations enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'conversations'
      and policyname = 'Authenticated users can read conversations'
  ) then
    create policy "Authenticated users can read conversations"
      on public.conversations
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'conversations'
      and policyname = 'Authenticated users can create conversations'
  ) then
    create policy "Authenticated users can create conversations"
      on public.conversations
      for insert
      to authenticated
      with check (true);
  end if;
end $$;

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
