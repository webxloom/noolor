-- Updated Timestamp Trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Slug Generator
-- create or replace function public.generate_slug(input text)
-- returns text
-- language sql
-- immutable
-- as $$
--   select trim(both '-' from regexp_replace(
--     lower(unaccent(input)),
--     '[^a-z0-9]+',
--     '-',
--     'g'
--   ));
-- $$;
CREATE OR REPLACE FUNCTION public.generate_slug(
    input_text TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                trim(input_text),
                '[^a-zA-Z0-9]+',
                '-',
                'g'
            ),
            '(^-|-$)',
            '',
            'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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