-- Updated Timestamp Trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Slug Generator
create or replace function public.generate_slug(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(unaccent(input)),
    '[^a-z0-9]+',
    '-',
    'g'
  ));
$$;

-- Admin Checker
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
    and role = 'admin'
  );
$$;

-- Moderator Checker
create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
    and role in ('admin', 'moderator')
  );
$$;