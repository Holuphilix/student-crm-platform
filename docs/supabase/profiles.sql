create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'user' check (role in ('user', 'admin', 'sales', 'manager')),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  alter column role set default 'user';

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
    check (role in ('user', 'admin', 'sales', 'manager'));
end $$;

alter table public.profiles enable row level security;

insert into public.profiles (id, full_name, email, role)
select
  id,
  raw_user_meta_data ->> 'full_name',
  email,
  case
    when raw_user_meta_data ->> 'role' in ('user', 'admin', 'sales', 'manager')
      then raw_user_meta_data ->> 'role'
    else 'user'
  end
from auth.users
on conflict (id) do nothing;

update public.profiles
set
  full_name = coalesce(public.profiles.full_name, auth.users.raw_user_meta_data ->> 'full_name'),
  email = coalesce(public.profiles.email, auth.users.email)
from auth.users
where public.profiles.id = auth.users.id;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can read their own profile'
  ) then
    create policy "Users can read their own profile"
      on public.profiles
      for select
      to authenticated
      using (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can create their own profile'
  ) then
    create policy "Users can create their own profile"
      on public.profiles
      for insert
      to authenticated
      with check (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update their own profile'
  ) then
    create policy "Users can update their own profile"
      on public.profiles
      for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    case
      when new.raw_user_meta_data ->> 'role' in ('user', 'admin', 'sales', 'manager')
        then new.raw_user_meta_data ->> 'role'
      else 'user'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile
  on auth.users;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
