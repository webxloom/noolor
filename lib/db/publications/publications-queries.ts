import { AuthorRecord } from "@/lib/types/authors";
import type { SupabaseClient } from "@supabase/supabase-js";

const publicationsTable = "publications";

export type PublicationsInsert = Omit<
  AuthorRecord,
  "created_at" | "id" | "slug"
> & {
  id?: string;
};

export type PublicationsUpdate = Partial<Omit<PublicationsInsert, "user_id">>;

export async function getPublicationsQuery(supabase: SupabaseClient) {
  return supabase
    .from(publicationsTable)
    .select(`*, profile:profiles(id,name,avatar_url)`)
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
      AuthorRecord & { profile: { name: string; avatar_url?: string } }
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
    .maybeSingle<AuthorRecord>();
}

export async function getPublicationByUserIdQuery(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from(publicationsTable)
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle<AuthorRecord>();

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
    .single<AuthorRecord>();
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
    .single<AuthorRecord>();
}

export async function deletePublicationQuery(
  supabase: SupabaseClient,
  publicationId: string,
) {
  return supabase.from(publicationsTable).delete().eq("id", publicationId);
}
