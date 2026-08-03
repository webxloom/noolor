import { PublicationRecord } from "@/lib/types/authors";
import type { SupabaseClient } from "@supabase/supabase-js";

const publicationsTable = "publications";

export type PublicationsInsert = Omit<
  PublicationRecord,
  "created_at" | "id" | "slug"
> & {
  id?: string;
};

export type PublicationsUpdate = Partial<Omit<PublicationsInsert, "user_id">>;

export async function getPublicationsQuery(supabase: SupabaseClient) {
  return supabase
    .from(publicationsTable)
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
}

export async function getPublicationsBySlugQuery(
  supabase: SupabaseClient,
  slug: string,
) {
  return supabase
    .from(publicationsTable)
    .select(`*, profile:profiles(*)`)
    .eq("slug", slug)
    .maybeSingle<
      PublicationRecord & { profile: { name: string; avatar_url?: string } }
    >();
}

export async function getPublicationsByIdQuery(
  supabase: SupabaseClient,
  authorId: string,
) {
  return supabase
    .from(publicationsTable)
    .select(`*, profile:profiles(name)`)
    .eq("id", authorId)
    .maybeSingle<PublicationRecord>();
}

export async function getPublicationByUserIdQuery(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from(publicationsTable)
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle<PublicationRecord>();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createPublicationsQuery(
  supabase: SupabaseClient,
  publication: PublicationsInsert,
) {
  return supabase
    .from(publicationsTable)
    .insert(publication)
    .select()
    .single<PublicationRecord>();
}

export async function updatePublicationQuery(
  supabase: SupabaseClient,
  publicationId: string,
  patch: PublicationsUpdate,
) {
  return supabase
    .from(publicationsTable)
    .update(patch)
    .eq("id", publicationId)
    .select()
    .single<PublicationRecord>();
}

export async function deletePublicationQuery(
  supabase: SupabaseClient,
  publicationId: string,
) {
  return supabase.from(publicationsTable).delete().eq("id", publicationId);
}
