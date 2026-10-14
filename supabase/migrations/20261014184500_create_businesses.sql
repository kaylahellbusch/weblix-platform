create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  industry text not null default 'roofing',
  phone text,
  email text,
  website text,
  city text,
  state text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists businesses_owner_id_idx on public.businesses (owner_id);
create index if not exists businesses_owner_id_created_at_idx
  on public.businesses (owner_id, created_at desc);

create or replace function public.set_businesses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
before update on public.businesses
for each row
execute function public.set_businesses_updated_at();

alter table public.businesses enable row level security;
alter table public.businesses force row level security;

create policy "Users can select their own businesses"
on public.businesses
for select
to authenticated
using (auth.uid() = owner_id);

create policy "Users can insert their own businesses"
on public.businesses
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Users can update their own businesses"
on public.businesses
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Users can delete their own businesses"
on public.businesses
for delete
to authenticated
using (auth.uid() = owner_id);
