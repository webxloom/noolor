import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type InviteRecord = {
  id: string;
  role: "writer" | "publication";
  name: string;
  phone: string;
  email?: string;
  is_verified: boolean;
  is_invited: boolean;
  is_registered: boolean;
  created_by?: string | null;
  created_at?: string | null;
};

// Get all invitations
export async function getAllInvitationsQuery(
  limit: number = 100,
): Promise<{ data: InviteRecord[]; error: any }> {
  const supabase: SupabaseClient = createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("invitations")
    .select(
      `
      *,
        creator:profiles!invitations_created_by_fkey(role)
      `,
    )
    .limit(limit)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invitations:", error);
    return { data: [], error };
  }
  return { data: data as InviteRecord[], error };
}

// Get an invitation by id
export async function getInvitationById(
  id: string,
): Promise<{ data: InviteRecord | null; error: any }> {
  const supabase: SupabaseClient = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching invitation by id:", error);
    return { data: null, error };
  }
  return { data: data as InviteRecord, error };
}

// Get an invitation by phone number
export async function getInvitationByPhone(
  phone: string,
): Promise<{ data: InviteRecord | null; error: any }> {
  const supabase: SupabaseClient = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    console.error("Error fetching invitation by phone:", error);
    return { data: null, error };
  }

  return { data: data as InviteRecord, error };
}

// Create new invitation
export async function createInvitation(payload: {
  role: "writer" | "publication";
  name: string;
  phone: string;
  email?: string;
  is_verified: boolean;
  is_invited: boolean;
  created_by?: string | null;
}): Promise<any> {
  const supabase: SupabaseClient = createBrowserSupabaseClient();
  const { role, name, phone, email, is_verified, is_invited, created_by } =
    payload;

  // First check if phone already exists in the profiles or invitations table
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .single();

  if (existingProfile) {
    throw new Error("Phone number already exists in profiles.");
  }

  const { data: existingInvitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("phone", phone)
    .single();

  if (existingInvitation) {
    throw new Error("Phone number already exists in invitations.");
  }

  const { data, error } = await supabase
    .from("invitations")
    .insert([{ email, role, name, phone, created_by, is_verified, is_invited }])
    .select()
    .single();

  if (error) {
    console.error("Error creating invitation:", error);
    return { errror: error.message || "Failed to create invitation" };
  }
  return { data };
}

// Update an existing invitation by id
export async function updateInvitation(
  id: string,
  payload: {
    role?: "writer" | "publication";
    name?: string;
    phone?: string;
    email?: string;
    is_verified?: boolean;
    is_invited?: boolean;
    is_registered?: boolean;
  },
): Promise<any> {
  const supabase: SupabaseClient = createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("invitations")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating invitation:", error);
    return { error: error.message || "Failed to update invitation" };
  }
  return { data };
}
