-- Invitation table schema
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_invited BOOLEAN NOT NULL DEFAULT false,
  is_registered BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to update updated_at on profile update
CREATE TRIGGER invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_invitations_phone ON public.invitations(phone);

-- Row level security policies
alter table public.invitations enable row level security;

-- Policy to allow users to insert invitations
create policy insert_invitations_policy on public.invitations
  for insert
  with check (auth.uid() is not null);

-- Policy to allow users to select invitations
create policy select_invitations_policy on public.invitations
  for select
  using (auth.uid() is not null);

-- Policy to allow users to update invitations
create policy update_invitations_policy on public.invitations
  for update
  using (auth.uid() is not null);

-- Policy to allow users to delete invitations
create policy delete_invitations_policy on public.invitations   
  for delete
  using (auth.uid() is not null);
