create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  cover_url text,
  language text,
  tags text[], -- ['writing', 'poetry']
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_blogs_user_id on public.blogs(user_id);
create index idx_blogs_is_published on public.blogs(is_published);
create index idx_blogs_tags on public.blogs using gin(tags);
create index idx_blogs_title_search on public.blogs using gin(to_tsvector('english', title));

-- Generate slug from name on insert
CREATE OR REPLACE FUNCTION generate_blog_slug(
    title TEXT,
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
        regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')
    );

    -- Remove leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);

    -- Append first 4 chars of UUID for uniqueness
    final_slug := base_slug || '-' || left(user_id::text, 4);

    RETURN final_slug;
END;
$$;

-- Trigger to set slug on insert
CREATE OR REPLACE FUNCTION set_blog_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.slug := generate_blog_slug(NEW.title, NEW.user_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER blogs_set_slug
BEFORE INSERT
ON blogs
FOR EACH ROW
EXECUTE FUNCTION set_blog_slug();

-- Policy to restrict access to blog data
alter table public.blogs enable row level security;

-- Anyone can view published blogs
create policy "Published blogs are public"
on public.blogs
for select
using (is_published = true);

-- Authenticated users can view drafts and their own blogs
create policy "Users can view their own blogs"
on public.blogs
for select
to authenticated
using (auth.uid() = user_id);

-- Users can create blogs
create policy "Users can create blogs"
on public.blogs
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can update their own blogs
create policy "Users can update their blogs"
on public.blogs
for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can delete their blogs"
on public.blogs
for delete
to authenticated
using (auth.uid() = user_id);