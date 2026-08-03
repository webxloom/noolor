CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    cover_image TEXT,
    event_type TEXT NOT NULL,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    event_mode TEXT NOT NULL DEFAULT 'online',
    venue_name TEXT,
    venue_address TEXT,
    city TEXT,
    meeting_url TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming',
    visibility TEXT NOT NULL DEFAULT 'public',
    interested_count INTEGER DEFAULT 0,
    going_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add in future
CREATE TABLE public.event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Generate slug from title on insert
CREATE OR REPLACE FUNCTION public.generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate slug on INSERT or when title changes
    IF TG_OP = 'INSERT'
         OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title)
    THEN
        NEW.slug :=
        lower(
            regexp_replace(
            trim(NEW.title),
            '[^a-zA-Z0-9]+',
            '-',
            'g'
            )
        );
    
        -- Remove leading/trailing hyphens
        NEW.slug := trim(both '-' FROM NEW.slug);
    
        -- Append host user id prefix for uniqueness
        NEW.slug := NEW.slug || '-' || left(NEW.host_id::text, 8);
    END IF;
    
    RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

-- Trigger to set slug on insert
CREATE TRIGGER events_generate_slug
BEFORE INSERT OR UPDATE OF title
ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.generate_event_slug();

-- RLS Policies for events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view public events
CREATE POLICY "Public events are visible to everyone"
ON public.events
FOR SELECT
USING (visibility = 'public');

-- Hosts can view their own events
CREATE POLICY "Hosts can view their own events"
ON public.events
FOR SELECT
USING (host_id = auth.uid());

-- Hosts and authenticated users can view private events
CREATE POLICY "Hosts and authenticated users can view private events"
ON public.events
FOR SELECT
USING (
    visibility = 'private' AND (
        host_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.event_participants ep
            WHERE ep.event_id = id AND ep.user_id = auth.uid()
        )
    )
);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = host_id
    )
);

-- Hosts can update their own events
CREATE POLICY "Hosts can update their own events"
ON public.events
FOR UPDATE
TO authenticated
USING (
    host_id = auth.uid()
)
WITH CHECK (
    host_id = auth.uid()
);

-- Hosts can delete their own events
CREATE POLICY "Hosts can delete their own events"
ON public.events
FOR DELETE
TO authenticated
USING (
    host_id = auth.uid()
);