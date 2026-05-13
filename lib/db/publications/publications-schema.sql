create table public.publications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null
    references public.profiles(id)
    on delete cascade,
  name text not null,
  description text,
  logo_url text,
  location text,
  languages text[], -- ['English', 'Tamil']
  social_links jsonb,
  -- Example:
  -- {
  --   "website": "...",
  --   "twitter": "...",
  --   "instagram": "..."
  -- }
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_publications_user_id on public.publications(user_id);
create index idx_publications_languages on public.publications using gin(languages);

-- Policy to restrict access to publication data
alter table public.publications enable row level security;

-- Anyone can view publication profiles
create policy "Publications are public"
on public.publications
for select
using (true);

-- Users can create their own publication profile
create policy "Users can create their publication profile"
on public.publications
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can update their own publication profile
create policy "Users can update their publication profile"
on public.publications
for update
to authenticated
using (auth.uid() = user_id);