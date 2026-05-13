create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  created_by uuid not null
    references public.profiles(id)
    on delete cascade,
  is_private boolean default false,
  language text,
  cover_url text,
  member_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_groups_created_by on public.groups(created_by);
create index idx_groups_is_private on public.groups(is_private);
create index idx_groups_name_search on public.groups using gin(to_tsvector('english', name));

-- Policy to restrict access to group data
alter table public.groups enable row level security;

-- Anyone can view public groups
create policy "Public groups are viewable"
on public.groups
for select
using (is_private = false);

-- Authenticated users can view private groups they are members of
create policy "Creator can view own groups"
on public.groups
for select
to authenticated
using (auth.uid() = created_by);

-- Users can create groups
create policy "Users can create groups"
on public.groups
for insert
to authenticated
with check (auth.uid() = created_by);

-- Users can update their own groups
create policy "Creator can update group"
on public.groups
for update
to authenticated
using (auth.uid() = created_by);