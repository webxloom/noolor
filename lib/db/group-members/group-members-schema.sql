-- Enum 
-- Group role enum type
create type public.group_role as enum (
  'member',
  'admin'
);

-- Status
create type public.group_member_status as enum (
  'pending',
  'approved',
  'rejected'
);

-- Group members table schema
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null
    references public.groups(id)
    on delete cascade,
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  role public.group_role default 'member',
  status public.group_member_status default 'pending',
  joined_at timestamp with time zone default now(),
  unique (group_id, user_id)
);

-- Indexes for performance
create index idx_group_members_group_id on public.group_members(group_id);
create index idx_group_members_user_id on public.group_members(user_id);
create index idx_group_members_status on public.group_members(status);

-- Policy to restrict access to group member data
alter table public.group_members enable row level security;

-- Users can view members of public groups
create policy "View members of public groups"
on public.group_members
for select
using (
  exists (
    select 1 from public.groups g
    where g.id = group_id
      and g.is_private = false
  )
);

-- Users can see their own membership status
create policy "Users can view their membership"
on public.group_members
for select
to authenticated
using (auth.uid() = user_id);

-- Join requests: Users can request to join groups
create policy "Users can join groups"
on public.group_members
for insert
to authenticated
with check (auth.uid() = user_id);

-- Group admins can approve/reject membership requests
create policy "Group admins can manage members"
on public.group_members
for update
to authenticated
using (
    exists (
        select 1 from public.group_members gm
        where gm.group_id = group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
        and gm.status = 'approved'
    )
    );

-- Group admins can remove members
create policy "Group admins can remove members"
on public.group_members
for delete
to authenticated
using (
    exists (
        select 1 from public.group_members gm
        where gm.group_id = group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
        and gm.status = 'approved'
    )
);

-- Users can leave groups
create policy "Users can leave groups"
on public.group_members
for delete
to authenticated
using (auth.uid() = user_id);

-- Group admins can update member roles
create policy "Group admins can update member roles"
on public.group_members
for update
to authenticated
using (
    exists (
        select 1 from public.group_members gm
        where gm.group_id = group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
        and gm.status = 'approved'
    )
);