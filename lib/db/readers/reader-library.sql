-- want_to_read
-- currently_reading
-- completed_books

CREATE TABLE public.reader_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    shelf TEXT NOT NULL DEFAULT 'want_to_read',
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    is_favorite BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, book_id)
);

-- Trigger to update updated_at on profile update
CREATE TRIGGER library_updated_at
BEFORE UPDATE ON public.reader_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_reader_library_user_id ON public.reader_library(user_id);
CREATE INDEX idx_reader_library_book_id ON public.reader_library(book_id);

-- Row level security policies
ALTER TABLE public.reader_library ENABLE ROW LEVEL SECURITY;

-- Allow all users to read reader_library entries
CREATE POLICY read_all ON public.reader_library
    FOR SELECT
    USING (true);

-- Policy to allow users to manage their own library entries
CREATE POLICY user_library_policy ON public.reader_library
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());