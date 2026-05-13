-- LIKES TABLE
create table public.likes (
  id uuid primary key
    default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  target_type public.engagement_target_enum
    not null,
  target_id uuid not null,
  created_at timestamptz default now(),

  unique(user_id, target_type, target_id)
);

-- INDEXES
create index likes_user_idx
on public.likes(user_id);

create index likes_target_idx
on public.likes(target_type, target_id);

create index likes_created_at_idx
on public.likes(created_at desc);

-- RLS POLICIES
-- Allow anyone to read likes, but only authenticated users can create or delete their own likes
create policy "public read likes"
on public.likes
for select
using (true);

create policy "users create likes"
on public.likes
for insert
with check (
  auth.uid() = user_id
);

create policy "users delete own likes"
on public.likes
for delete
using (
  auth.uid() = user_id
);