-- Authors table schema
create table public.authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null
    references public.profiles(id)
    on delete cascade,
  name text not null,
  slug text unique not null,
  bio text,
  avatar_url text,
  location text,
  languages text[], -- ['English', 'Tamil']
  genres text[],    -- ['Fiction', 'Poetry']
  awards jsonb,   -- Example:  -- [  --   { "title": "Best Writer 2024", "year": 2024, "fileUrl": "" }  -- ]
  upcoming_works jsonb,  -- Example:  -- [{ -- "title": "Book Name",  --     "description": "About the book",  --     "quote": "Sample quote"  --   }  -- ]
  social_links jsonb,
  -- Example:
  -- {
  --   "twitter": "...",
  --   "instagram": "...",
  --   "website": "..."
  -- }
  rating numeric(2,1) default 0, -- optional cached value
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_authors_user_id on public.authors(user_id);
create index idx_authors_slug on public.authors(slug);
create index idx_authors_genres on public.authors using gin(genres);
create index idx_authors_languages on public.authors using gin(languages);

-- Generate slug from name on insert
CREATE OR REPLACE FUNCTION generate_author_slug(
    name TEXT,
    user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
BEGIN
    -- Convert name into URL-friendly slug
    base_slug := lower(
        regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')
    );

    -- Remove leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);

    -- Append first 4 chars of UUID for uniqueness
    final_slug := base_slug || '-' || left(user_id::text, 4);

    RETURN final_slug;
END;
$$;

-- Trigger to set slug on insert
CREATE OR REPLACE FUNCTION set_author_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.slug := generate_author_slug(NEW.name, NEW.user_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER authors_set_slug
BEFORE INSERT
ON authors
FOR EACH ROW
EXECUTE FUNCTION set_author_slug();

-- Policy to restrict access to author data
alter table public.authors enable row level security;

-- Anyone can view author profiles
create policy "Authors are public"
on public.authors
for select
using (true);

-- Users can create their own author profile
create policy "Users can create their author profile"
on public.authors
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can update their own author profile
create policy "Users can update their author profile"
on public.authors
for update
to authenticated
using (auth.uid() = user_id);

-- Users can delete their own author profile
create policy "Users can delete their author profile"
on public.authors
for delete
to authenticated
using (auth.uid() = user_id);