-- Student CRM assessment alignment migration.
-- Apply after the existing profile/conversation/ownership SQL files.

-- ADMIN is the canonical MANAGER role for this assessment.
-- Existing legacy manager rows are folded into admin to avoid duplicate role concepts.
update public.profiles
set role = 'admin'
where role = 'manager';

do $$
declare
  role_constraint_name text;
begin
  select conname
    into role_constraint_name
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%role%'
  limit 1;

  if role_constraint_name is not null then
    execute format(
      'alter table public.profiles drop constraint %I',
      role_constraint_name
    );
  end if;

  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('user', 'admin', 'sales'));
end $$;

-- Required assessment pipeline stages.
do $$
declare
  clients_status_constraint_name text;
  deals_stage_constraint_name text;
begin
  select conname
    into clients_status_constraint_name
  from pg_constraint
  where conrelid = 'public.clients'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%'
  limit 1;

  if clients_status_constraint_name is not null then
    execute format(
      'alter table public.clients drop constraint %I',
      clients_status_constraint_name
    );
  end if;

  select conname
    into deals_stage_constraint_name
  from pg_constraint
  where conrelid = 'public.deals'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%stage%'
  limit 1;

  if deals_stage_constraint_name is not null then
    execute format(
      'alter table public.deals drop constraint %I',
      deals_stage_constraint_name
    );
  end if;
end $$;

update public.clients
set status = case status
  when 'lead' then 'new_lead'
  when 'qualified' then 'contacted'
  when 'proposal' then 'application_started'
  else status
end;

update public.deals
set stage = case stage
  when 'lead' then 'new_lead'
  when 'qualified' then 'contacted'
  when 'proposal' then 'application_started'
  else stage
end;

alter table public.clients
  alter column status set default 'new_lead';

alter table public.deals
  alter column stage set default 'new_lead';

alter table public.clients
  add constraint clients_status_check
  check (
    status in (
      'new_lead',
      'contacted',
      'consultation_booked',
      'documents_requested',
      'application_started',
      'submitted',
      'won',
      'lost'
    )
  );

alter table public.deals
  add constraint deals_stage_check
  check (
    stage in (
      'new_lead',
      'contacted',
      'consultation_booked',
      'documents_requested',
      'application_started',
      'submitted',
      'won',
      'lost'
    )
  );

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

create index if not exists clients_status_idx
  on public.clients(status);

create index if not exists deals_stage_idx
  on public.deals(stage);

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
      and tablename = 'clients'
  ) then
    alter publication supabase_realtime
      add table public.clients;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'deals'
  ) then
    alter publication supabase_realtime
      add table public.deals;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'deal_notes'
  ) then
    alter publication supabase_realtime
      add table public.deal_notes;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'deal_stage_history'
  ) then
    alter publication supabase_realtime
      add table public.deal_stage_history;
  end if;
end $$;
