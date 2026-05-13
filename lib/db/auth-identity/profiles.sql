-- Stores platform-level user data.
create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  location text,
  preferred_language text default 'en',
  user_type public.user_type_enum not null,
  subscription_type public.subscription_type_enum
    default 'free',
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint username_length_check
    check (
      char_length(username) between 3 and 30
    ),

  constraint username_format_check
    check (
      username ~ '^[a-z0-9_]+$'
    )
);

-- INDEXES
create index profiles_username_idx
on public.profiles(username);

create index profiles_user_type_idx
on public.profiles(user_type);

create index profiles_is_active_idx
on public.profiles(is_active);

create index profiles_created_at_idx
on public.profiles(created_at desc);

-- TRIGGERS
create trigger profiles_set_updated_at
before update
on public.profiles
for each row
execute function public.set_updated_at();

-- AUTO PROFILE CREATION
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    username,
    display_name,
    user_type
  )
  values (
    new.id,

    concat(
      'user_',
      substr(new.id::text, 1, 8)
    ),

    coalesce(
      new.raw_user_meta_data->>'name',
      'New User'
    ),

    'reader'
  );

  insert into public.user_roles (
    user_id,
    role
  )
  values (
    new.id,
    'reader'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert
on auth.users
for each row
execute function public.handle_new_user();

-- RLS POLICIES
-- Public Read Active Profiles
create policy "public read active profiles"
on public.profiles
for select
using (
  is_active = true
);

-- Users Insert Own Profile
create policy "users insert own profile"
on public.profiles
for insert
with check (
  auth.uid() = id
);

-- Users Update Own Profile
create policy "users update own profile"
on public.profiles
for update
using (
  auth.uid() = id
)
with check (
  auth.uid() = id
);

-- Admins Manage Profiles
create policy "admins manage profiles"
on public.profiles
for all
using (
  public.is_admin()
)
with check (
  public.is_admin()
);