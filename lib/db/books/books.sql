-- BOOKS TABLE
create table public.books (
  id uuid primary key
    default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  short_description text,
  full_description text,
  isbn text,
  page_count integer,
  publication_year integer,
  edition text,
  book_type public.book_type_enum
    default 'physical',
  visibility public.book_visibility_enum
    default 'public',
  status public.book_status_enum
    default 'draft',
  featured boolean default false,
  allow_reviews boolean default true,
  allow_orders boolean default true,
  is_active boolean default true,
  created_by uuid not null
    references public.profiles(id)
    on delete cascade,
  approved_by uuid
    references public.profiles(id),
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint books_slug_format_check
    check (
      slug ~ '^[a-z0-9-]+$'
    ),

  constraint books_page_count_check
    check (
      page_count is null
      or page_count > 0
    )
);

-- BOOK AUTHORS TABLE
create table public.book_authors (
  id uuid primary key
    default gen_random_uuid(),
  book_id uuid not null
    references public.books(id)
    on delete cascade,
  author_id uuid not null
    references public.authors(id)
    on delete cascade,
  is_primary boolean default false,
  created_at timestamptz default now(),

  unique(book_id, author_id)
);

-- BOOK PUBLICATIONS TABLE
create table public.book_publications (
  id uuid primary key
    default gen_random_uuid(),
  book_id uuid not null
    references public.books(id)
    on delete cascade,
  publication_id uuid not null
    references public.publications(id)
    on delete cascade,
  created_at timestamptz default now(),

  unique(book_id, publication_id)
);

-- BOOK MEDIA TABLE
create table public.book_media (
  id uuid primary key
    default gen_random_uuid(),
  book_id uuid not null
    references public.books(id)
    on delete cascade,
  cover_image_url text,
  preview_pdf_url text,
  full_pdf_url text,
  thumbnail_url text,
  created_at timestamptz default now()
);

-- BOOK INVENTORY TABLE
create table public.book_inventory (
  id uuid primary key
    default gen_random_uuid(),
  book_id uuid not null unique
    references public.books(id)
    on delete cascade,
  available_copies integer default 0,
  allow_preorder boolean default false,
  updated_at timestamptz default now(),

  constraint inventory_non_negative_check
    check (
      available_copies >= 0
    )
);

-- INDEXES
-- Books Indexes
create index books_slug_idx
on public.books(slug);

create index books_status_idx
on public.books(status);

create index books_visibility_idx
on public.books(visibility);

create index books_featured_idx
on public.books(featured);

create index books_created_by_idx
on public.books(created_by);

create index books_created_at_idx
on public.books(created_at desc);

create index books_published_at_idx
on public.books(published_at desc);

create index books_search_idx
on public.books
using gin (
  to_tsvector(
    'simple',
    coalesce(title, '') || ' ' ||
    coalesce(subtitle, '') || ' ' ||
    coalesce(short_description, '')
  )
);

create index book_authors_book_idx
on public.book_authors(book_id);

create index book_authors_author_idx
on public.book_authors(author_id);

create index book_publications_book_idx
on public.book_publications(book_id);

create index book_publications_publication_idx
on public.book_publications(publication_id);

create index book_genres_book_idx
on public.book_genres(book_id);

create index book_genres_genre_idx
on public.book_genres(genre_id);

create index book_languages_book_idx
on public.book_languages(book_id);

create index book_languages_language_idx
on public.book_languages(language_id);

create index book_media_book_idx
on public.book_media(book_id);

-- UPDATED_AT TRIGGER
create trigger books_set_updated_at
before update
on public.books
for each row
execute function public.set_updated_at();

-- Book Slug Function
create or replace function public.set_book_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.generate_slug(new.title);
  end if;

  return new;
end;
$$;

create trigger books_slug_trigger
before insert
on public.books
for each row
execute function public.set_book_slug();

-- RLS POLICIES
-- Public Read Published Books
create policy "public read published books"
on public.books
for select
using (
  status = 'published'
  and visibility = 'public'
  and is_active = true
);

-- Owners Read Own Books
create policy "owners read own books"
on public.books
for select
using (
  auth.uid() = created_by
);

-- Writers Create Books
create policy "writers create books"
on public.books
for insert
with check (
  auth.uid() = created_by
);

-- Writers Update Own Books
create policy "writers update own books"
on public.books
for update
using (
  auth.uid() = created_by
)
with check (
  auth.uid() = created_by
);

-- Writers Delete Own Drafts
create policy "writers delete own draft books"
on public.books
for delete
using (
  auth.uid() = created_by
  and status = 'draft'
);

-- Admins Manage Books
create policy "admins manage books"
on public.books
for all
using (
  public.is_moderator()
)
with check (
  public.is_moderator()
);

-- BOOK AUTHORS POLICIES
-- Public Read Book Authors
create policy "public read book authors"
on public.book_authors
for select
using (true);

-- Owners Manage Book Authors
create policy "owners manage book authors"
on public.book_authors
for all
using (
  exists (
    select 1
    from public.books
    where books.id = book_authors.book_id
    and books.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.books
    where books.id = book_authors.book_id
    and books.created_by = auth.uid()
  )
);

-- BOOK PUBLICATIONS POLICIES
-- Public Read Book Publications
create policy "public read book publications"
on public.book_publications
for select
using (true);

-- Owners Manage Book Publications
create policy "owners manage book publications"
on public.book_publications
for all
using (
  exists (
    select 1
    from public.books
    where books.id = book_publications.book_id
    and books.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.books
    where books.id = book_publications.book_id
    and books.created_by = auth.uid()
  )
);

-- BOOK MEDIA POLICIES
-- Only allow media to be read for active books
create policy "public read book media"
on public.book_media
for select
using (true);

-- Only allow book owners to manage media
create policy "owners manage book media"
on public.book_media
for all
using (
  exists (
    select 1
    from public.books
    where books.id = book_media.book_id
    and books.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.books
    where books.id = book_media.book_id
    and books.created_by = auth.uid()
  )
);

-- BOOK INVENTORY POLICIES
-- Only allow inventory to be read for active books
create policy "public read book inventory"
on public.book_inventory
for select
using (true);

-- Only allow book owners to manage inventory
create policy "owners manage inventory"
on public.book_inventory
for all
using (
  exists (
    select 1
    from public.books
    where books.id = book_inventory.book_id
    and books.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.books
    where books.id = book_inventory.book_id
    and books.created_by = auth.uid()
  )
);