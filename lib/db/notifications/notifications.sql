-- NOTIFICATIONS TABLE
create table public.notifications (
  id uuid primary key
    default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  type public.notification_type_enum
    not null,
  title text not null,
  message text,
  action_url text,
  image_url text,
  metadata jsonb default '{}'::jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- NOTIFICATION PREFERENCES TABLE
create table public.notification_preferences (
  id uuid primary key
    default gen_random_uuid(),
  user_id uuid not null unique
    references public.profiles(id)
    on delete cascade,
  email_enabled boolean default true,
  whatsapp_enabled boolean default true,
  push_enabled boolean default true,
  marketing_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INDEXES
create index notifications_user_idx
on public.notifications(user_id);

create index notifications_read_idx
on public.notifications(is_read);

create index notifications_created_at_idx
on public.notifications(created_at desc);

create index notifications_type_idx
on public.notifications(type);

create index notification_preferences_user_idx
on public.notification_preferences(user_id);

-- UPDATED_AT TRIGGER
create trigger notification_preferences_set_updated_at
before update
on public.notification_preferences
for each row
execute function public.set_updated_at();

-- AUTO CREATE NOTIFICATION PREFERENCES
create or replace function public.create_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_preferences (
    user_id
  )
  values (
    new.id
  );

  return new;
end;
$$;

create trigger create_notification_preferences_trigger
after insert
on public.profiles
for each row
execute function public.create_notification_preferences();

-- RLS POLICIES
-- Users can read their own notifications
create policy "users read own notifications"
on public.notifications
for select
using (
  auth.uid() = user_id
);

-- Users can create notifications for themselves (e.g. via API)
create policy "moderators create notifications"
on public.notifications
for insert
with check (
  public.is_moderator()
);  

-- Users can update their own notifications (e.g. mark as read)
create policy "users update own notifications"
on public.notifications
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

-- Moderators can manage all notifications
create policy "moderators manage notifications"
on public.notifications
for all
using (
  public.is_moderator()
)
with check (
  public.is_moderator()
);

-- Users can read their own notification preferences
create policy "users read own notification preferences"
on public.notification_preferences
for select
using (
  auth.uid() = user_id
);

-- Users can update their own notification preferences
create policy "users update own notification preferences"
on public.notification_preferences
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

-- Users can create their own notification preferences (handled by trigger on profiles)
create policy "users create own notification preferences"
on public.notification_preferences
for insert
with check (
  auth.uid() = user_id
);