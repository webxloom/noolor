-- 1. Create Role and subscription enums

-- 2. Profiles table schema
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  contact_email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'reader',
  avatar_url TEXT,
  subscription_plan subscription_plan NOT NULL DEFAULT 'free',
  is_active boolean NOT NULL DEFAULT true,
  is_verified boolean NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


insert into public.profiles (id, name, username, phone, contact_email, roles, role, subscription_plan)
select id, name, username, phone, contact_email, roles, role, subscription_plan
from auth.users;

-- 3. Trigger to update updated_at on profile update
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- Indexes for performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_contact_email ON public.profiles(contact_email);
CREATE INDEX idx_profiles_roles ON public.profiles USING GIN(roles);
CREATE INDEX idx_profiles_subscription_plan ON public.profiles(subscription_plan);

-- Trigger to update author/publication slugs when profile name or roles change
CREATE OR REPLACE FUNCTION update_profile_slug()
RETURNS TRIGGER AS $$
DECLARE
    generated_slug TEXT;
    do_update BOOLEAN := false;
BEGIN
    -- Only proceed when username changed or on insert
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.username IS DISTINCT FROM NEW.username OR OLD.roles IS DISTINCT FROM NEW.roles)) THEN
        -- Use the centralized generate_slug helper then append short id for uniqueness
        generated_slug := public.generate_slug(coalesce(NEW.username, '')) || '-' || left(NEW.id::text, 8);
        do_update := true;
    END IF;

    IF do_update THEN        
        IF NEW.role = 'writer' THEN
            UPDATE public.authors
            SET slug = generated_slug
            WHERE profile_id = NEW.id;
        END IF;

        IF NEW.role = 'publication' THEN
            UPDATE public.publications
            SET slug = generated_slug
            WHERE profile_id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- Run the slug updater on insert and updates (handled inside function)
CREATE TRIGGER trg_update_profile_slug
AFTER INSERT OR UPDATE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_profile_slug();

-- Profile creation is handled explicitly by the registration route after the
-- auth user is created. Remove the old auth trigger so profile writes happen
-- in one application-controlled flow.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Row level security policies
alter table public.profiles enable row level security;

-- Users can view all profiles
CREATE POLICY "Public profiles are viewable"
ON public.profiles
FOR SELECT
USING (true);

-- Logged-in users can view their own profile
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id);