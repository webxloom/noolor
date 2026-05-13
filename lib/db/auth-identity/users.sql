-- USER ROLES TABLE
-- Supports scalable permission system.
create table public.user_roles (
  id uuid primary key
    default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  role public.role_enum not null,
  created_at timestamptz default now(),
  unique(user_id, role)
);

-- INDEXES
create index user_roles_user_id_idx
on public.user_roles(user_id);

create index user_roles_role_idx
on public.user_roles(role);

-- RLS POLICIES
-- Users Read Own Roles
create policy "users read own roles"
on public.user_roles
for select
using (
  auth.uid() = user_id
);

-- Admins Manage Roles
create policy "admins manage roles"
on public.user_roles
for all
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- USER FOLLOWS TABLE
create table public.user_follows (
  id uuid primary key
    default gen_random_uuid(),
  follower_id uuid not null
    references public.profiles(id)
    on delete cascade,
  following_id uuid not null
    references public.profiles(id)
    on delete cascade,
  created_at timestamptz default now(),

  constraint no_self_follow
    check (follower_id <> following_id),

  unique(follower_id, following_id)
);

-- INDEXES
create index user_follows_follower_idx
on public.user_follows(follower_id);

create index user_follows_following_idx
on public.user_follows(following_id);

-- RLS POLICIES
-- Public Read Follows
create policy "public read follows"
on public.user_follows
for select
using (true);

-- Users Follow Others
create policy "users create follows"
on public.user_follows
for insert
with check (
  auth.uid() = follower_id
);

-- Users Remove Own Follows
create policy "users delete own follows"
on public.user_follows
for delete
using (
  auth.uid() = follower_id
);