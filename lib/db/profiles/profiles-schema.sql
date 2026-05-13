-- Role enum type
create type public.user_role as enum (
  'guest',
  'reader',
  'writer',
  'publication',
  'admin'
);

-- Profiles table schema
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text unique not null,
  role public.user_role not null default 'reader',
  is_premium boolean default false,
  avatar_url text,
  languages text[], -- ['English', 'Tamil']
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_is_premium on public.profiles(is_premium);

-- Profile creation is handled explicitly by the registration route after the
-- auth user is created. Remove the old auth trigger so profile writes happen
-- in one application-controlled flow.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Row level security policies
alter table public.profiles enable row level security;

-- Users can view all profiles
create policy "Public profiles are viewable"
on public.profiles
for select
to authenticated
using (true);

-- Users can update their own profile
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id);