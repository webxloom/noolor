-- Table
create table public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL references profiles(id) on delete cascade,
    roles text[] not null default '{}'::text[],
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

-- Trigger to update updated_at on profile update
CREATE TRIGGER roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Row level security policies
alter table public.user_roles enable row level security;

-- Select: Public 
CREATE POLICY select_user_roles ON public.user_roles
FOR SELECT
using (true);

-- Insert / Update / Delete: Only the user themselves or Admin can modify their roles
CREATE POLICY modify_user_roles_insert
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    )
);

CREATE POLICY modify_user_roles_update
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    )
)
WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    )
);

CREATE POLICY modify_user_roles_delete
ON public.user_roles
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    )
);