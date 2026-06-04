import type { Session, User } from "@supabase/supabase-js";

export type DashboardRole =
  | "admin"
  | "scholar"
  | "publication"
  | "reader"
  | "writer";

export type SessionUser = {
  name: string;
  username?: string;
  id: string;
  email?: string;
  phone?: string;
  contact_email?: string;
  avatar_url?: string;
  subcription_plan: string;
  role: DashboardRole;
};

const validRoles = new Set<DashboardRole>([
  "admin",
  "scholar",
  "publication",
  "reader",
  "writer",
]);

function getRole(candidate: unknown): DashboardRole {
  if (
    typeof candidate === "string" &&
    validRoles.has(candidate as DashboardRole)
  ) {
    return candidate as DashboardRole;
  }

  return "reader";
}

export function mapSupabaseUser(user: User): SessionUser {
  const metadata = user.user_metadata ?? {};

  return {
    avatar_url:
      typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined,
    email: user.email,
    id: user.id,
    contact_email:
      typeof metadata.contact_email === "string"
        ? metadata.contact_email
        : undefined,
    name:
      typeof metadata.name === "string" && metadata.name.trim().length > 0
        ? metadata.name
        : (user.email ?? user.phone ?? "Reader"),
    username:
      typeof metadata.username === "string" &&
      metadata.username.trim().length > 0
        ? metadata.username
        : undefined,
    subcription_plan:
      typeof metadata.subscription_plan === "string"
        ? metadata.subscription_plan
        : "free",
    phone: metadata.phone,
    role: getRole(metadata.role),
  };
}

export function mapSessionUser(session: Session | null) {
  return session?.user ? mapSupabaseUser(session.user) : null;
}
