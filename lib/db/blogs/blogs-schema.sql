create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references public.profiles(id) on delete set null,
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
create index idx_blogs_user_id on public.blogs(host_id);
create index idx_blogs_is_published on public.blogs(is_published);
create index idx_blogs_tags on public.blogs using gin(tags);
create index idx_blogs_title_search on public.blogs using gin(to_tsvector('english', title));

-- Generate slug from title on insert
CREATE OR REPLACE FUNCTION public.generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug on INSERT or when title changes
  IF TG_OP = 'INSERT'
     OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title)
  THEN
    NEW.slug :=
      lower(
        regexp_replace(
          trim(NEW.title),
          '[^a-zA-Z0-9]+',
          '-',
          'g'
        )
      );

    -- Remove leading/trailing hyphens
    NEW.slug := trim(both '-' FROM NEW.slug);

    -- Append author id prefix for uniqueness
    NEW.slug := NEW.slug || '-' || left(NEW.host_id::text, 8);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set slug on insert
CREATE TRIGGER blogs_generate_slug
BEFORE INSERT OR UPDATE OF title
ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.generate_blog_slug();

-- Policy to restrict access to blog data
alter table public.blogs enable row level security;

-- Anyone can view published blogs
create policy "Published blogs are public"
on public.blogs
for select
using (is_published = true);

-- Hosts can view their own blogs
CREATE POLICY "Hosts can view their own blogs"
ON public.blogs
FOR SELECT
USING (host_id = auth.uid());

-- Authenticated users can create blogs
CREATE POLICY "Authenticated users can create blogs"
ON public.blogs
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = host_id
    )
);

-- Hosts can update their own blogs
CREATE POLICY "Hosts can update their own blogs"
ON public.blogs
FOR UPDATE
TO authenticated
USING (
    host_id = auth.uid()
)
WITH CHECK (
    host_id = auth.uid()
);

-- Hosts can delete their own blogs
CREATE POLICY "Hosts can delete their own blogs"
ON public.blogs
FOR DELETE
TO authenticated
USING (
    host_id = auth.uid()
);