-- ORDERS TABLE
create table public.orders (
  id uuid primary key
    default gen_random_uuid(),
  user_id uuid
    references public.profiles(id)
    on delete set null,
  order_number text not null unique,
  status public.order_status_enum
    default 'pending',
  source public.order_source_enum
    default 'web',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  notes text,
  seller_contacted boolean default false,
  buyer_confirmed_delivery boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ITEMS TABLE
create table public.order_items (
  id uuid primary key
    default gen_random_uuid(),
  order_id uuid not null
    references public.orders(id)
    on delete cascade,
  book_id uuid not null
    references public.books(id)
    on delete set null,
  quantity integer default 1,
  seller_type text not null,
  seller_id uuid not null,
  created_at timestamptz default now(),

  constraint order_items_quantity_check
    check (
      quantity > 0
    )
);

-- ORDER NUMBER GENERATION
create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  next_number integer;
begin
  select count(*) + 1
  into next_number
  from public.orders;

  return concat(
    'NLR-',
    extract(year from now()),
    '-',
    lpad(next_number::text, 6, '0')
  );
end;
$$;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := public.generate_order_number();
  end if;

  return new;
end;
$$;

create trigger orders_set_order_number
before insert
on public.orders
for each row
execute function public.set_order_number();

-- INDEXES
create index orders_user_idx
on public.orders(user_id);

create index orders_status_idx
on public.orders(status);

create index orders_order_number_idx
on public.orders(order_number);

create index orders_created_at_idx
on public.orders(created_at desc);

create index order_items_order_idx
on public.order_items(order_id);

create index order_items_book_idx
on public.order_items(book_id);

create index order_items_seller_idx
on public.order_items(seller_type, seller_id);

-- UPDATED_AT TRIGGERS
create trigger orders_set_updated_at
before update
on public.orders
for each row
execute function public.set_updated_at();

-- RLS POLICIES
-- Users Read Own Orders
create policy "users read own orders"
on public.orders
for select
using (
  auth.uid() = user_id
);

-- Users Create Orders
create policy "users create orders"
on public.orders
for insert
with check (
  auth.uid() = user_id
);

-- Users Update Limited Order Fields
create policy "users update own orders"
on public.orders
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

-- Moderators/Admins Manage Orders
create policy "moderators manage orders"
on public.orders
for all
using (
  public.is_moderator()
)
with check (
  public.is_moderator()
);

-- Users Read Own Order Items
create policy "users read own order items"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

-- Users Create Own Order Items
create policy "users create own order items"
on public.order_items
for insert
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

-- Moderators/Admins Manage Order Items
create policy "moderators manage order items"
on public.order_items
for all
using (
  public.is_moderator()
)
with check (
  public.is_moderator()
);