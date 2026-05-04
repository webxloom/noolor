create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  book_id uuid
    references public.books(id)
    on delete cascade,
  author_id uuid
    references public.authors(id)
    on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  content text,
  created_at timestamp with time zone default now(),
  -- Ensure only ONE target (book OR author)
  check (
    (book_id is not null and author_id is null)
    or
    (book_id is null and author_id is not null)
  )
);

-- Prevent duplicate reviews by the same user for the same target
create unique index unique_user_book_review
on public.reviews(user_id, book_id)
where book_id is not null;

create unique index unique_user_author_review
on public.reviews(user_id, author_id)
where author_id is not null;

-- Indexes for performance
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_reviews_book_id on public.reviews(book_id);
create index idx_reviews_author_id on public.reviews(author_id);

-- Policy to restrict access to reviews
alter table public.reviews enable row level security;

-- Reviews are public
create policy "Reviews are public"
on public.reviews
for select
using (true);

-- Users can create reviews for books or authors
create policy "Users can create reviews"
on public.reviews
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can update or delete their own reviews
create policy "Users can update their reviews"
on public.reviews
for update
to authenticated
using (auth.uid() = user_id);