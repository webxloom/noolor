-- BOOKMARKS TABLE
create table public.bookmarks (
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
create index bookmarks_user_idx
on public.bookmarks(user_id);

create index bookmarks_target_idx
on public.bookmarks(target_type, target_id);

create index bookmarks_created_at_idx
on public.bookmarks(created_at desc);

-- RLS POLICIES
-- Allow anyone to read bookmarks, but only authenticated users can create or delete their own bookmarks
create policy "users read own bookmarks"
on public.bookmarks
for select
using (
  auth.uid() = user_id
);

create policy "users create bookmarks"
on public.bookmarks
for insert
with check (
  auth.uid() = user_id
);

create policy "users delete own bookmarks"
on public.bookmarks
for delete
using (
  auth.uid() = user_id
);