-- Authors table schema
CREATE TABLE public.authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    pen_name TEXT,
    slug TEXT NOT NULL UNIQUE,
    location TEXT,
    bio TEXT,
    languages TEXT[] DEFAULT '{}',
    genres TEXT[] DEFAULT '{}',
    awards JSONB DEFAULT '{}'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRIGGER to update updated_at on author profile update
CREATE TRIGGER authors_updated_at
BEFORE UPDATE ON public.authors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_authors_pen_name ON public.authors(pen_name);
CREATE INDEX idx_authors_slug ON public.authors(slug);
CREATE INDEX idx_authors_location ON public.authors(location);
CREATE INDEX idx_authors_languages ON public.authors USING GIN(languages);
CREATE INDEX idx_authors_genres ON public.authors USING GIN(genres);
CREATE INDEX idx_authors_awards ON public.authors USING GIN(awards);
CREATE INDEX idx_authors_social_links ON public.authors USING GIN(social_links);

-- Generate slug from name on insert
CREATE OR REPLACE FUNCTION authors_generate_slug()
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
CREATE TRIGGER trg_authors_generate_slug
BEFORE INSERT
ON authors
FOR EACH ROW
EXECUTE FUNCTION authors_generate_slug();

-- Policy to restrict access to author data
alter table public.authors enable row level security;

-- Anyone can view author profiles
create policy "Authors are public"
on public.authors
for select
using (true);

-- Users can create their own author profile
create policy "Users can create their author profile"
on public.authors
for insert
to authenticated
with check (auth.uid() = );

-- Users can update their own author profile
create policy "Users can update their author profile"
on public.authors
for update
to authenticated
using (auth.uid() = profile_id);

-- Users can delete their own author profile
create policy "Users can delete their author profile"
on public.authors
for delete
to authenticated
using (auth.uid() = profile_id);