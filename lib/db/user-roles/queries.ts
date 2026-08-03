import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const noolorImageBucket = process.env.SUPABASE_BUCKET_NAME ?? "noolor";

// Upload image to Supabase Storage and return the public URL
function getStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return publicUrl.substring(index + marker.length);
}

// Insert/Update a new user role into the user_roles table
export async function insertUserRole(
  userId: string,
  role: string,
): Promise<{ data: any; error: any }> {
  const supabase: SupabaseClient = createBrowserSupabaseClient();

  //   Check if the user already has roles in the user_roles table
  const { data: existingRoles, error: fetchError } = await supabase
    .from("user_roles")
    .select("roles")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  let queryResult = null;
  if (existingRoles) {
    // If the user already has roles, update the existing record
    const updatedRoles = Array.from(new Set([...existingRoles.roles, role]));
    queryResult = await supabase
      .from("user_roles")
      .update({ roles: updatedRoles })
      .eq("user_id", userId);
  } else {
    queryResult = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, roles: [role] }]);
  }

  return { data: queryResult.data, error: queryResult.error };
}

// Role Image Upload
export async function uploadRoleImageQuery(
  roleId: string,
  role: string,
  file: File,
  fileNamePrefix: string,
) {
  const supabase = createBrowserSupabaseClient();
  const roleTable = role === "publication" ? "publications" : "authors";
  const roleAvatarColumn =
    role === "publication" ? "publication_avatar_url" : "author_avatar_url";

  try {
    // Check if profile id has an existing avatar and remove it if so
    const { data: existingAvatar, error: existingError } = await supabase
      .from(roleTable)
      .select(roleAvatarColumn)
      .eq("id", roleId)
      .maybeSingle();

    if (existingError) {
      console.error("Error fetching existing avatar:", existingError);
    }
    const prevUrl = existingAvatar
      ? ((existingAvatar as Record<string, string>)[roleAvatarColumn] ?? null)
      : null;

    if (prevUrl) {
      try {
        const prevPath = getStoragePath(prevUrl, noolorImageBucket);
        if (prevPath && prevPath !== fileNamePrefix) {
          await supabase.storage.from(noolorImageBucket).remove([prevPath]);
        }
      } catch (e) {
        console.warn("Failed to remove previous avatar from storage:", e);
      }
    }

    // Upload current file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(noolorImageBucket)
      .upload(fileNamePrefix, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { error: uploadError };
    }

    // Get the public URL of the uploaded image
    const { data } = supabase.storage
      .from(noolorImageBucket)
      .getPublicUrl(fileNamePrefix);

    // Update the author/publication record with the new avatar URL
    // Insert new record if not found, or update existing one
    const { error: updateError } = await supabase.from(roleTable).upsert(
      {
        profile_id: roleId,
        [roleAvatarColumn]: data.publicUrl,
      },
      {
        onConflict: "profile_id",
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
