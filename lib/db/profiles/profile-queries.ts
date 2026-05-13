import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileRole =
  | "guest"
  | "reader"
  | "writer"
  | "publication"
  | "admin";

export type ProfileRecord = {
  id: string;
  name?: string | null;
  phone: string;
  role: ProfileRole;
  is_premium?: boolean | null;
  avatar_url?: string | null;
  languages?: string[] | null;
};

export type ProfileUpdate = Partial<Omit<ProfileRecord, "id">>;

export async function getProfileByIdQuery(
  supabase: SupabaseClient,
  profileId: string,
) {
  return supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle<ProfileRecord>();
}

export async function createProfileQuery(
  supabase: SupabaseClient,
  profile: ProfileRecord,
) {
  return supabase.from("profiles").insert(profile).select().single();
}

export async function updateProfileQuery(
  supabase: SupabaseClient,
  profileId: string,
  patch: ProfileUpdate,
) {
  return supabase
    .from("profiles")
    .update(patch)
    .eq("id", profileId)
    .select()
    .single();
}

export async function deleteProfileQuery(
  supabase: SupabaseClient,
  profileId: string,
) {
  return supabase.from("profiles").delete().eq("id", profileId);
}
