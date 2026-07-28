import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type ProfileRole = "reader" | "admin";

export type ProfileRecord = {
  id: string;
  name: string;
  contact_email: string | null;
  phone: string;
  username: string;
  role: ProfileRole;
  subscription_plan: string;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  other_roles?: string[] | undefined; // Optional property for other roles
};

export type ProfileUpdate = Partial<Omit<ProfileRecord, "id">>;

const authorImageBucket = process.env.SUPABASE_BUCKET_NAME ?? "noolor";
const authorImageFolder = "author-images";

export async function getProfileByIdQuery(
  supabase: SupabaseClient,
  profileId: string,
) {
  // User basic profile details
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle<ProfileRecord>();
  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return { data: null, error: profileError };
  }

  // User other roles
  const { data: otherRoles, error: otherRolesError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", profileId)
    .maybeSingle();

  if (otherRolesError) {
    console.error("Error fetching other roles:", otherRolesError);
    return { data: null, error: otherRolesError };
  }

  const profileWithRoles = {
    ...profile,
    other_roles: otherRoles?.roles ?? [],
  };

  return { data: profileWithRoles, error: null };
}

// Check if phone number or username already exists and return specific error
export async function checkExistingProfileQuery(
  phone: string,
  username: string,
) {
  const supabase: SupabaseClient = createBrowserSupabaseClient();

  const { data: existingProfiles, error: fetchError } = await supabase
    .from("profiles")
    .select("id,phone,username")
    .or(`phone.eq.${phone},username.eq.${username}`);

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (existingProfiles && existingProfiles.length > 0) {
    const phoneExists = existingProfiles.some((p: any) => p.phone === phone);
    const usernameExists = existingProfiles.some(
      (p: any) => p.username === username,
    );

    if (phoneExists && usernameExists) {
      return { error: "Phone number and username already exist." };
    }

    if (phoneExists) {
      return { error: "Phone number already exists." };
    }

    if (usernameExists) {
      return { error: "Username already exists." };
    }

    // Fallback generic message if we couldn't determine which field matched
    return { error: "Phone number or username already exists." };
  }

  return { error: null };
}

// Find profile by phone or email for password reset
export async function findProfileByPhoneOrEmail(identifier: string) {
  const supabase: SupabaseClient = createBrowserSupabaseClient();

  // Check if identifier is email or phone
  const isEmail = identifier.includes("@");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, phone, contact_email, name")
    .or(
      isEmail
        ? `contact_email.eq.${identifier}`
        : `phone.eq.${identifier},contact_email.eq.${identifier}`,
    )
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!profile) {
    return { data: null, error: "No account found with this phone or email." };
  }

  return { data: profile, error: null };
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

// Upload image to Supabase Storage and return the public URL
function getStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return publicUrl.substring(index + marker.length);
}

export async function uploadProfileImageQuery(
  profileId: string,
  file: File,
  fileNamePrefix: string,
) {
  const supabase = createBrowserSupabaseClient();

  try {
    // Check if profile id has an existing avatar and remove it if so
    const { data: existingAvatar, error: existingError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", profileId)
      .single();

    if (existingError) {
      console.error("Error fetching existing avatar:", existingError);
    }
    const prevUrl = existingAvatar?.avatar_url ?? null;

    if (prevUrl) {
      try {
        const prevPath = getStoragePath(prevUrl, authorImageBucket);
        if (prevPath && prevPath !== fileNamePrefix) {
          await supabase.storage.from(authorImageBucket).remove([prevPath]);
        }
      } catch (e) {
        console.warn("Failed to remove previous avatar from storage:", e);
      }
    }

    // Upload current file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(authorImageBucket)
      .upload(fileNamePrefix, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { error: uploadError };
    }

    // Get the public URL of the uploaded image
    const { data } = supabase.storage
      .from(authorImageBucket)
      .getPublicUrl(fileNamePrefix);
    // Update the profile record with the new avatar URL
    const { error: updateError } = await updateProfileQuery(
      supabase,
      profileId,
      {
        avatar_url: data.publicUrl,
      },
    );
    if (updateError) {
      return { error: updateError };
    }

    return { message: "Image uploaded successfully", url: data.publicUrl };
  } catch (error) {
    console.error("Error checking existing avatar:", error);
  }
}
