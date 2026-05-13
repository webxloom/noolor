-- REPORTS TABLE
create table public.reports (
  id uuid primary key
    default gen_random_uuid(),
  reporter_id uuid
    references public.profiles(id)
    on delete set null,
  target_type public.moderation_target_enum
    not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status public.moderation_status_enum
    default 'pending',
  reviewed_by uuid
    references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- MODERATION QUEUE TABLE
create table public.moderation_queue (
  id uuid primary key
    default gen_random_uuid(),
  target_type public.moderation_target_enum
    not null,
  target_id uuid not null,
  moderation_type text not null,
  submitted_by uuid
    references public.profiles(id)
    on delete set null,
  status public.moderation_status_enum
    default 'pending',
  priority integer default 1,
  notes text,
  reviewed_by uuid
    references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- MODERATION LOGS TABLE
create table public.moderation_logs (
  id uuid primary key
    default gen_random_uuid(),
  target_type public.moderation_target_enum
    not null,
  target_id uuid not null,
  action_type public.moderation_action_enum
    not null,
  performed_by uuid
    references public.profiles(id)
    on delete set null,
  reason text,
  notes text,
  created_at timestamptz default now()
);

-- INDEXES
create index reports_reporter_idx
on public.reports(reporter_id);

create index reports_target_idx
on public.reports(target_type, target_id);

create index reports_status_idx
on public.reports(status);

create index reports_created_at_idx
on public.reports(created_at desc);

create index moderation_queue_target_idx
on public.moderation_queue(target_type, target_id);

create index moderation_queue_status_idx
on public.moderation_queue(status);

create index moderation_queue_priority_idx
on public.moderation_queue(priority desc);

create index moderation_queue_created_at_idx
on public.moderation_queue(created_at desc);

create index moderation_logs_target_idx
on public.moderation_logs(target_type, target_id);

create index moderation_logs_action_idx
on public.moderation_logs(action_type);

create index moderation_logs_created_at_idx
on public.moderation_logs(created_at desc);

-- RLS POLICIES
-- Only allow users to see their own reports and create reports where they are the reporter
create policy "users read own reports"
on public.reports
for select
using (
  auth.uid() = reporter_id
);

create policy "users create reports"
on public.reports
for insert
with check (
  auth.uid() = reporter_id
);

-- Only allow moderators to manage reports
create policy "moderators manage reports"
on public.reports
for all
using (
  public.is_moderator()
)
with check (
  public.is_moderator()
);

-- Only allow moderators to see and manage the moderation queue
create policy "moderators read moderation queue"
on public.moderation_queue
for select
using (
  public.is_moderator()
);

create policy "moderators manage moderation queue"
on public.moderation_queue
for all
using (
  public.is_moderator()
)
with check (
  public.is_moderator()
);

-- Only allow moderators to see and create moderation logs
create policy "moderators read moderation logs"
on public.moderation_logs
for select
using (
  public.is_moderator()
);

create policy "moderators create moderation logs"
on public.moderation_logs
for insert
with check (
  public.is_moderator()
);