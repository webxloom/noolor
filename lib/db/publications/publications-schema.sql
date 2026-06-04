-- Publications table schema
create table public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  location text,
  bio TEXT,
  awards JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRIGGER to update updated_at on author profile update
CREATE TRIGGER publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_publications_slug ON public.publications(slug);
CREATE INDEX idx_publications_location ON public.publications(location);
CREATE INDEX idx_publications_awards ON public.publications USING GIN(awards);
CREATE INDEX idx_publications_social_links ON public.publications USING GIN(social_links);

-- Generate slug from name on insert
CREATE OR REPLACE FUNCTION publications_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
    profile_name text;
BEGIN
    SELECT username
    INTO profile_name
    FROM profiles
    WHERE id = NEW.profile_id;

    NEW.slug :=
        lower(
            regexp_replace(
                regexp_replace(trim(profile_name), '[^a-zA-Z0-9]+', '-', 'g'),
                '(^-|-$)',
                '',
                'g'
            )
        )
        || '-'
        || left(NEW.profile_id::text, 8);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set slug on insert
CREATE TRIGGER trg_publications_generate_slug
BEFORE INSERT
ON publications
FOR EACH ROW
EXECUTE FUNCTION publications_generate_slug();

-- Policy to restrict access to publication data
alter table public.publications enable row level security;

-- Anyone can view publication profiles
create policy "Publications are public"
on public.publications
for select
using (true);

-- Users can create their own publication profile
create policy "Users can create their publication profile"
on public.publications
for insert
to authenticated
with check (auth.uid() = profile_id);

-- Users can update their own publication profile
create policy "Users can update their publication profile"
on public.publications
for update
to authenticated
using (auth.uid() = profile_id);

-- Users can delete their own publication profile
create policy "Users can delete their publication profile"
on public.publications
for delete
to authenticated
using (auth.uid() = profile_id);