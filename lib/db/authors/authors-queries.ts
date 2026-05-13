import { AuthorRecord } from "@/lib/types/authors";
import type { SupabaseClient } from "@supabase/supabase-js";

const authorTable = "authors";

export type AuthorInsert = Omit<AuthorRecord, "created_at" | "id" | "slug"> & {
  id?: string;
};

export type AuthorUpdate = Partial<Omit<AuthorInsert, "user_id">>;

export async function getAuthorsQuery(supabase: SupabaseClient) {
  return supabase
    .from(authorTable)
    .select("*")
    .order("created_at", { ascending: false })
    .returns<AuthorRecord[]>();
}

export async function getAuthorBySlugQuery(
  supabase: SupabaseClient,
  slug: string,
) {
  return supabase
    .from(authorTable)
    .select("*")
    .eq("slug", slug)
    .maybeSingle<AuthorRecord>();
}

export async function getAuthorByUserIdQuery(
  supabase: SupabaseClient,
  userId: string,
) {
  return supabase
    .from(authorTable)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<AuthorRecord>();
}

export async function createAuthorQuery(
  supabase: SupabaseClient,
  author: AuthorInsert,
) {
  return supabase
    .from(authorTable)
    .insert(author)
    .select()
    .single<AuthorRecord>();
}

export async function updateAuthorQuery(
  supabase: SupabaseClient,
  authorId: string,
  patch: AuthorUpdate,
) {
  return supabase
    .from(authorTable)
    .update(patch)
    .eq("id", authorId)
    .select()
    .single<AuthorRecord>();
}

export async function deleteAuthorQuery(
  supabase: SupabaseClient,
  authorId: string,
) {
  return supabase.from(authorTable).delete().eq("id", authorId);
}
