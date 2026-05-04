-- CARTS TABLE
create table public.carts (
  id uuid primary key
    default gen_random_uuid(),
  user_id uuid not null unique
    references public.profiles(id)
    on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CART ITEMS TABLE
create table public.cart_items (
  id uuid primary key
    default gen_random_uuid(),
  cart_id uuid not null
    references public.carts(id)
    on delete cascade,
  book_id uuid not null
    references public.books(id)
    on delete cascade,
  quantity integer default 1,
  created_at timestamptz default now(),

  constraint cart_items_quantity_check
    check (
      quantity > 0
    ),

  unique(cart_id, book_id)
);

-- INDEXES
create index carts_user_idx
on public.carts(user_id);

create index cart_items_cart_idx
on public.cart_items(cart_id);

create index cart_items_book_idx
on public.cart_items(book_id);

-- UPDATED_AT TRIGGERS
create trigger carts_set_updated_at
before update
on public.carts
for each row
execute function public.set_updated_at();

-- RLS POLICIES
-- Users Read Own Cart
create policy "users read own cart"
on public.carts
for select
using (
  auth.uid() = user_id
);

-- Users Create Own Cart
create policy "users create own cart"
on public.carts
for insert
with check (
  auth.uid() = user_id
);

-- Users Update Own Cart
create policy "users update own cart"
on public.carts
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

-- Users Delete Own Cart
create policy "users delete own cart"
on public.carts
for delete
using (
  auth.uid() = user_id
);

-- Users Read Own Cart Items
create policy "users read own cart items"
on public.cart_items
for select
using (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
    and carts.user_id = auth.uid()
  )
);

-- Users Manage Own Cart Items
create policy "users manage own cart items"
on public.cart_items
for all
using (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
    and carts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
    and carts.user_id = auth.uid()
  )
);