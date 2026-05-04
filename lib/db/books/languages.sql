-- LANGUAGES TABLE
create table public.languages (
  id uuid primary key
    default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  native_name text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- BOOK LANGUAGES TABLE
create table public.book_languages (
  id uuid primary key
    default gen_random_uuid(),
  book_id uuid not null
    references public.books(id)
    on delete cascade,
  language_id uuid not null
    references public.languages(id)
    on delete cascade,

  unique(book_id, language_id)
);

-- RLS POLICIES
-- Only allow active languages to be read
create policy "public read languages"
on public.languages
for select
using (
  is_active = true
);  

-- Admin Manage
create policy "admins manage languages"
on public.languages
for all
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- Allow all users to read book languages (even if the language itself is inactive, since the book may still be active)
create policy "public read book languages"
on public.book_languages
for select
using (true);

-- Only allow book owners to manage book languages
create policy "owners manage book languages"
on public.book_languages
for all
using (
  exists (
    select 1
    from public.books
    where books.id = book_languages.book_id
    and books.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.books
    where books.id = book_languages.book_id
    and books.created_by = auth.uid()
  )
);