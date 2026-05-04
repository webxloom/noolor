-- AUTHORS TABLE
create table public.authors (
  id uuid primary key
    default gen_random_uuid(),
  profile_id uuid not null unique
    references public.profiles(id)
    on delete cascade,
  slug text not null unique,
  pen_name text not null,
  short_bio text,
  full_bio text,
  achievements_summary text,
  profile_image_url text,
  cover_image_url text,
  is_verified boolean default false,
  verification_status
    public.verification_status_enum
    default 'pending',
  featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint author_slug_format_check
    check (
      slug ~ '^[a-z0-9-]+$'
    )
);

-- AUTHOR LINKS TABLE
create table public.author_links (
  id uuid primary key
    default gen_random_uuid(),
  author_id uuid not null
    references public.authors(id)
    on delete cascade,
  link_type public.author_link_type_enum not null,
  label text,
  url text not null,
  created_at timestamptz default now()
);

-- AUTHOR ACHIEVEMENTS TABLE
create table public.author_achievements (
  id uuid primary key
    default gen_random_uuid(),
  author_id uuid not null
    references public.authors(id)
    on delete cascade,
  title text not null,
  description text,
  achievement_date date,
  created_at timestamptz default now()
);

-- AUTHOR VERIFICATIONS TABLE
create table public.author_verifications (
  id uuid primary key
    default gen_random_uuid(),
  author_id uuid not null
    references public.authors(id)
    on delete cascade,
  proof_type text not null,
  proof_title text,
  proof_url text not null,
  notes text,
  status public.verification_status_enum
    default 'pending',
  reviewed_by uuid
    references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- INDEXES
-- Authors Indexes
create index authors_profile_id_idx
on public.authors(profile_id);

create index authors_slug_idx
on public.authors(slug);

create index authors_verified_idx
on public.authors(is_verified);

create index authors_featured_idx
on public.authors(featured);

create index authors_active_idx
on public.authors(is_active);

-- Author Links
create index author_links_author_id_idx
on public.author_links(author_id);

-- Author Achievements
create index author_achievements_author_id_idx
on public.author_achievements(author_id);

-- Author Verifications
create index author_verifications_author_id_idx
on public.author_verifications(author_id);

create index author_verifications_status_idx
on public.author_verifications(status);

-- UPDATED_AT TRIGGERS
create trigger authors_set_updated_at
before update
on public.authors
for each row
execute function public.set_updated_at();

-- Author Slug Generator
create or replace function public.set_author_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.generate_slug(new.pen_name);
  end if;

  return new;
end;
$$;

create trigger authors_slug_trigger
before insert
on public.authors
for each row
execute function public.set_author_slug();

-- RLS POLICIES
-- Public Read Active Authors
create policy "public read active authors"
on public.authors
for select
using (
  is_active = true
);

-- Users Create Own Author Profile
create policy "users create own author profile"
on public.authors
for insert
with check (
  auth.uid() = profile_id
);

-- Users Update Own Author Profile
create policy "users update own author profile"
on public.authors
for update
using (
  auth.uid() = profile_id
)
with check (
  auth.uid() = profile_id
);

-- Admins Manage Authors
create policy "admins manage authors"
on public.authors
for all
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- AUTHOR LINKS POLICIES
-- Public Read Author Links
create policy "public read author links"
on public.author_links
for select
using (true);

-- Users Manage Own Author Links
create policy "authors manage own links"
on public.author_links
for all
using (
  exists (
    select 1
    from public.authors
    where authors.id = author_links.author_id
    and authors.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.authors
    where authors.id = author_links.author_id
    and authors.profile_id = auth.uid()
  )
);

-- AUTHOR ACHIEVEMENTS POLICIES
-- Public Read Author Achievements
create policy "public read author achievements"
on public.author_achievements
for select
using (true);

-- Users Manage Own Author Achievements
create policy "authors manage own achievements"
on public.author_achievements
for all
using (
  exists (
    select 1
    from public.authors
    where authors.id = author_achievements.author_id
    and authors.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.authors
    where authors.id = author_achievements.author_id
    and authors.profile_id = auth.uid()
  )
);

-- AUTHOR VERIFICATION POLICIES
-- Authors Read Own Verification Requests
create policy "authors read own verifications"
on public.author_verifications
for select
using (
  exists (
    select 1
    from public.authors
    where authors.id = author_verifications.author_id
    and authors.profile_id = auth.uid()
  )
);

-- Authors Submit Verification Requests
create policy "authors submit verifications"
on public.author_verifications
for insert
with check (
  exists (
    select 1
    from public.authors
    where authors.id = author_verifications.author_id
    and authors.profile_id = auth.uid()
  )
);

-- Admins Moderate Verification Requests
create policy "admins manage author verifications"
on public.author_verifications
for all
using (
  public.is_moderator()
)
with check (
  public.is_moderator()
);