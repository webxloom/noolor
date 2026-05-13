import type { Session, User } from "@supabase/supabase-js";

export type DashboardRole =
  | "admin"
  | "guest"
  | "publication"
  | "reader"
  | "writer";

export type SessionUser = {
  avatar_url?: string;
  email?: string;
  id: string;
  is_premium: boolean;
  languages?: string[];
  name: string;
  phone?: string;
  role: DashboardRole;
};

const validRoles = new Set<DashboardRole>([
  "admin",
  "guest",
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
    is_premium: metadata.is_premium === true,
    languages:
      Array.isArray(metadata.languages) &&
      metadata.languages.every((lang) => typeof lang === "string")
        ? metadata.languages
        : undefined,
    name:
      typeof metadata.name === "string" && metadata.name.trim().length > 0
        ? metadata.name
        : (user.email ?? user.phone ?? "Reader"),
    phone: user.phone,
    role: getRole(metadata.role),
  };
}

export function mapSessionUser(session: Session | null) {
  return session?.user ? mapSupabaseUser(session.user) : null;
}
