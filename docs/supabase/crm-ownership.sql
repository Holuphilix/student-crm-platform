alter table public.clients
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table public.deals
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table public.conversations
  add column if not exists author_id uuid references auth.users(id) on delete set null;

alter table public.deal_notes
  add column if not exists author_id uuid references auth.users(id) on delete set null;

create index if not exists clients_owner_id_idx
  on public.clients(owner_id);

create index if not exists deals_owner_id_idx
  on public.deals(owner_id);

create index if not exists conversations_author_id_idx
  on public.conversations(author_id);

create index if not exists deal_notes_author_id_idx
  on public.deal_notes(author_id);
