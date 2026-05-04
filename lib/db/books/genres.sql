-- GENRES TABLE
create table public.genres (
  id uuid primary key
    default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),

  constraint genres_slug_format_check
    check (
      slug ~ '^[a-z0-9-]+$'
    )
);

-- BOOK GENRES TABLE
create table public.book_genres (
  id uuid primary key
    default gen_random_uuid(),
  book_id uuid not null
    references public.books(id)
    on delete cascade,
  genre_id uuid not null
    references public.genres(id)
    on delete cascade,

  unique(book_id, genre_id)
);

-- RLS POLICIES
-- Only allow active genres to be read
create policy "public read genres"
on public.genres
for select
using (
  is_active = true
);

-- Admin Manage
create policy "admins manage genres"
on public.genres
for all
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- Allow all users to read book genres (even if the genre itself is inactive, since the book may still be active)
create policy "public read book genres"
on public.book_genres
for select
using (true);

-- Only allow book owners to manage book genres
create policy "owners manage book genres"
on public.book_genres
for all
using (
  exists (
    select 1
    from public.books
    where books.id = book_genres.book_id
    and books.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.books
    where books.id = book_genres.book_id
    and books.created_by = auth.uid()
  )
);