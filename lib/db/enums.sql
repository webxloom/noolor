-- User Type Enum
create type public.user_type_enum as enum (
  'reader',
  'writer',
  'publication'
);

-- Subscription Type Enum
create type public.subscription_type_enum as enum (
  'free',
  'premium'
);

-- Role Enum
create type public.role_enum as enum (
  'reader',
  'writer',
  'publication',
  'moderator',
  'admin'
);

-- Authors Verification Status Enum
create type public.verification_status_enum as enum (
  'pending',
  'under_review',
  'approved',
  'rejected'
);

-- Publication Member Role
create type public.publication_member_role_enum as enum (
  'owner',
  'admin',
  'editor',
  'staff'
);

-- Author Link Type
create type public.author_link_type_enum as enum (
  'website',
  'facebook',
  'instagram',
  'twitter',
  'youtube',
  'linkedin',
  'whatsapp',
  'email'
);

-- Book Status
create type public.book_status_enum as enum (
  'draft',
  'pending',
  'approved',
  'rejected',
  'published'
);

-- Book Visibility
create type public.book_visibility_enum as enum (
  'public',
  'private',
  'unlisted'
);

-- Book Type
create type public.book_type_enum as enum (
  'physical',
  'digital',
  'both'
);

-- Engagement Target Type
create type public.engagement_target_enum as enum (
  'book',
  'author',
  'publication',
  'blog'
);

-- Review Status
create type public.review_status_enum as enum (
  'pending',
  'approved',
  'rejected'
);

-- Order Status
create type public.order_status_enum as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- Order Source
create type public.order_source_enum as enum (
  'web',
  'whatsapp',
  'manual'
);

-- Moderation Target Type
create type public.moderation_target_enum as enum (
  'book',
  'author',
  'publication',
  'review',
  'blog'
);

-- Moderation Status
create type public.moderation_status_enum as enum (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'resolved'
);

-- Moderation Action Type
create type public.moderation_action_enum as enum (
  'approve',
  'reject',
  'hide',
  'restore',
  'warn',
  'suspend'
);

-- Notification Type
create type public.notification_type_enum as enum (
  'new_follower',
  'book_approved',
  'book_rejected',
  'review_received',
  'order_created',
  'order_updated',
  'verification_approved',
  'verification_rejected',
  'report_resolved',
  'system'
);

-- Notification Channel
create type public.notification_channel_enum as enum (
  'in_app',
  'email',
  'whatsapp',
  'push'
);