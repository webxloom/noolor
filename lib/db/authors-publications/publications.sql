-- PUBLICATIONS TABLE
create table public.publications (
  id uuid primary key
    default gen_random_uuid(),
  profile_id uuid unique
    references public.profiles(id)
    on delete cascade,
  slug text not null unique,
  name text not null,
  short_description text,
  full_description text,
  logo_url text,
  cover_image_url text,
  website_url text,
  contact_email text,
  whatsapp_number text,
  is_verified boolean default false,
  verification_status
    public.verification_status_enum
    default 'pending',
  featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint publication_slug_format_check
    check (
      slug ~ '^[a-z0-9-]+$'
    )
);

-- PUBLICATION MEMBERS TABLE
create table public.publication_members (
  id uuid primary key
    default gen_random_uuid(),
  publication_id uuid not null
    references public.publications(id)
    on delete cascade,
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  role public.publication_member_role_enum
    default 'staff',
  created_at timestamptz default now(),

  unique(publication_id, user_id)
);

-- PUBLICATION LINKS TABLE
create table public.publication_links (
  id uuid primary key
    default gen_random_uuid(),
  publication_id uuid not null
    references public.publications(id)
    on delete cascade,
  link_type public.author_link_type_enum not null,
  label text,
  url text not null,
  created_at timestamptz default now()
);

-- INDEXES
-- Publications
create index publications_slug_idx
on public.publications(slug);

create index publications_verified_idx
on public.publications(is_verified);

create index publications_featured_idx
on public.publications(featured);

-- Publication Members
create index publication_members_publication_idx
on public.publication_members(publication_id);

create index publication_members_user_idx
on public.publication_members(user_id);

-- UPDATED_AT TRIGGERS
create trigger publications_set_updated_at
before update
on public.publications
for each row
execute function public.set_updated_at();

-- Publication Slug Generator
create or replace function public.set_publication_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.generate_slug(new.name);
  end if;

  return new;
end;
$$;

create trigger publications_slug_trigger
before insert
on public.publications
for each row
execute function public.set_publication_slug();

-- RLS POLICIES
-- Public Read
create policy "public read active publications"
on public.publications
for select
using (
  is_active = true
);

-- Users Create Own Publication
create policy "users create own publication"
on public.publications
for insert
with check (
  auth.uid() = profile_id
);

-- Publication Members Manage Publication
create policy "publication admins update publication"
on public.publications
for update
using (
  exists (
    select 1
    from public.publication_members
    where publication_members.publication_id = publications.id
    and publication_members.user_id = auth.uid()
    and publication_members.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.publication_members
    where publication_members.publication_id = publications.id
    and publication_members.user_id = auth.uid()
    and publication_members.role in ('owner', 'admin')
  )
);

-- Publication Members Read
create policy "publication members read members"
on public.publication_members
for select
using (true);

-- Publication Owners Manage Members
create policy "publication owners manage members"
on public.publication_members
for all
using (
  exists (
    select 1
    from public.publication_members pm
    where pm.publication_id = publication_members.publication_id
    and pm.user_id = auth.uid()
    and pm.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.publication_members pm
    where pm.publication_id = publication_members.publication_id
    and pm.user_id = auth.uid()
    and pm.role = 'owner'
  )
);