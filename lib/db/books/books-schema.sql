create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  author_id uuid
    references public.authors(id)
    on delete set null,
  publication_id uuid
    references public.publications(id)
    on delete set null,
  cover_url text,
  back_cover_url text,
  language text,
  genres text[], -- ['Fiction', 'Drama']
  description text,
  quotes jsonb,
  -- Example:
  -- [
  --   "A powerful line...",
  --   "Another quote..."
  -- ]
  is_free boolean default false,
  price numeric(10,2),
  page_count integer,
  published_year integer,
  content_url text, -- PDF / EPUB / external link
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_books_author_id on public.books(author_id);
create index idx_books_publication_id on public.books(publication_id);
create index idx_books_genres on public.books using gin(genres);
create index idx_books_title on public.books using gin(to_tsvector('english', title));

-- Generate slug from name on insert
CREATE OR REPLACE FUNCTION generate_book_slug(
    title TEXT,
    author_id UUID
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
    final_slug := base_slug || '-' || left(author_id::text, 4);

    RETURN final_slug;
END;
$$;

-- Trigger to set slug on insert
CREATE OR REPLACE FUNCTION set_book_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.slug := generate_book_slug(NEW.title, NEW.author_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER books_set_slug
BEFORE INSERT
ON books
FOR EACH ROW
EXECUTE FUNCTION set_book_slug();

-- Policy to restrict access to book data
alter table public.books enable row level security;

-- Anyone can view book profiles
create policy "Books are public"
on public.books
for select
using (true);

-- Authenticated users can create books
create policy "Authors or publications can create books"
on public.books
for insert
to authenticated
with check (
  exists (
    select 1 from public.authors a
    where a.user_id = auth.uid()
      and a.id = author_id
  )
  or
  exists (
    select 1 from public.publications p
    where p.user_id = auth.uid()
      and p.id = publication_id
  )
);

-- Authors or publications can update their own books
create policy "Users can update their own books"
on public.books
for update
to authenticated
using (
  exists (
    select 1 from public.authors a
    where a.user_id = auth.uid()
      and a.id = author_id
  )
  or
  exists (
    select 1 from public.publications p
    where p.user_id = auth.uid()
      and p.id = publication_id
  )
);

create policy "Users can delete their own books"
on public.books
for delete
to authenticated
using (
  exists (
    select 1 from public.authors a
    where a.user_id = auth.uid()
      and a.id = author_id
  )
  or
  exists (
    select 1 from public.publications p
    where p.user_id = auth.uid()
      and p.id = publication_id
  )
);