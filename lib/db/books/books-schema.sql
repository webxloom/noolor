create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  author_id uuid references public.authors(id) on delete set null,
  author_name text,
  publication_id uuid references public.publications(id) on delete set null,
  publication_name text,
  cover_url text,
  back_cover_url text,
  language text,
  genres text[], -- ['Fiction', 'Drama']
  description text,
  quote text,
  is_free boolean default false,
  price numeric(10,2),
  page_count integer,
  published_year integer,
  page_limit integer default 0,
  content_url text, -- PDF / EPUB / external link
  awards jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_books_author_id on public.books(author_id);
create index idx_books_publication_id on public.books(publication_id);
create index idx_books_genres on public.books using gin(genres);
create index idx_books_title on public.books using gin(to_tsvector('english', title));

-- Generate slug from name on insert
CREATE OR REPLACE FUNCTION public.generate_book_slug()
RETURNS TRIGGER AS $$
DECLARE
  owner_suffix TEXT;
BEGIN
  -- Generate slug on INSERT or when title changes
  IF TG_OP = 'INSERT'
     OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title)
  THEN
    NEW.slug := lower(
      regexp_replace(
        trim(NEW.title),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    );

    -- Remove leading/trailing hyphens
    NEW.slug := trim(both '-' FROM NEW.slug);

    -- Use author_id if present, otherwise publication_id
    owner_suffix := left(
      COALESCE(
        NEW.author_id::text,
        NEW.publication_id::text
      ),
      8
    );

    NEW.slug := NEW.slug || '-' || owner_suffix;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set slug on insert
CREATE TRIGGER books_generate_slug
BEFORE INSERT OR UPDATE OF title
ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.generate_book_slug();

-- Policy to restrict access to book data
alter table public.books enable row level security;

-- Anyone can view book profiles
create policy "Books are public"
on public.books
for select
using (true);

-- Authenticated users can create books
CREATE POLICY "Users can create books"
ON public.books
FOR INSERT
TO authenticated
WITH CHECK (
  (
    author_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.authors a
      WHERE a.id = books.author_id
        AND a.profile_id = auth.uid()
    )
  )
  OR
  (
    publication_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.publications p
      WHERE p.id = books.publication_id
        AND p.profile_id = auth.uid()
    )
  )
);

-- Authors can update their own books
CREATE POLICY "Users can update their own books"
ON public.books
FOR UPDATE
TO authenticated
USING (
  (
    author_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.authors a
      WHERE a.id = books.author_id
        AND a.profile_id = auth.uid()
    )
  )
  OR
  (
    publication_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.publications p
      WHERE p.id = books.publication_id
        AND p.profile_id = auth.uid()
    )
  )
)
WITH CHECK (
  (
    author_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.authors a
      WHERE a.id = books.author_id
        AND a.profile_id = auth.uid()
    )
  )
  OR
  (
    publication_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.publications p
      WHERE p.id = books.publication_id
        AND p.profile_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their own books"
ON public.books
FOR DELETE
TO authenticated
USING (
  (
    author_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.authors a
      WHERE a.id = books.author_id
        AND a.profile_id = auth.uid()
    )
  )
  OR
  (
    publication_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.publications p
      WHERE p.id = books.publication_id
        AND p.profile_id = auth.uid()
    )
  )
);