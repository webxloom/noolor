-- REVIEWS TABLE
create table public.reviews (
  id uuid primary key
    default gen_random_uuid(),
  book_id uuid not null
    references public.books(id)
    on delete cascade,
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  rating integer not null,
  review_title text,
  review_text text,
  status public.review_status_enum
    default 'approved',
  is_spoiler boolean default false,
  likes_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint reviews_rating_check
    check (
      rating between 1 and 5
    ),

  unique(book_id, user_id)
);

-- REVIEW VOTES TABLE
create table public.review_votes (
  id uuid primary key
    default gen_random_uuid(),
  review_id uuid not null
    references public.reviews(id)
    on delete cascade,
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  is_helpful boolean not null,
  created_at timestamptz default now(),

  unique(review_id, user_id)
);

-- INDEXES
create index reviews_book_idx
on public.reviews(book_id);

create index reviews_user_idx
on public.reviews(user_id);

create index reviews_status_idx
on public.reviews(status);

create index reviews_rating_idx
on public.reviews(rating);

create index reviews_created_at_idx
on public.reviews(created_at desc);

create index review_votes_review_idx
on public.review_votes(review_id);

create index review_votes_user_idx
on public.review_votes(user_id);

-- UPDATED_AT TRIGGER
create trigger reviews_set_updated_at
before update
on public.reviews
for each row
execute function public.set_updated_at();

-- RLS POLICIES
-- Approved reviews are public, but users can only see their own reviews if they are not approved
create policy "public read approved reviews"
on public.reviews
for select
using (
  status = 'approved'
);

create policy "users read own reviews"
on public.reviews
for select
using (
  auth.uid() = user_id
);

create policy "users create reviews"
on public.reviews
for insert
with check (
  auth.uid() = user_id
);

create policy "users update own reviews"
on public.reviews
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "users delete own reviews"
on public.reviews
for delete
using (
  auth.uid() = user_id
);

create policy "moderators manage reviews"
on public.reviews
for all
using (
  public.is_moderator()
)
with check (
  public.is_moderator()
);

-- Review votes are public, but users can only create or delete their own votes
create policy "public read review votes"
on public.review_votes
for select
using (true);

create policy "users create review votes"
on public.review_votes
for insert
with check (
  auth.uid() = user_id
);

create policy "users delete own review votes"
on public.review_votes
for delete
using (
  auth.uid() = user_id
);