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
    .select(`*, profile:profiles(id,name,avatar_url)`)
    .order("created_at", { ascending: false });
}

export async function getAuthorBySlugQuery(
  supabase: SupabaseClient,
  slug: string,
) {
  return supabase
    .from(authorTable)
    .select(`*, profile:profiles(*)`)
    .eq("slug", slug)
    .maybeSingle<
      AuthorRecord & { profile: { name: string; avatar_url?: string } }
    >();
}

export async function getAuthorByIdQuery(
  supabase: SupabaseClient,
  authorId: string,
) {
  return supabase
    .from(authorTable)
    .select(`*, profile:profiles(name)`)
    .eq("id", authorId)
    .maybeSingle<AuthorRecord>();
}

export async function getAuthorByUserIdQuery(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from(authorTable)
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle<AuthorRecord>();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getBooksCountForAuthors(
  supabase: SupabaseClient,
  authors: AuthorRecord[],
) {
  const authorIds = authors.map((author) => author.id);

  const { data: books, error } = await supabase
    .from("books")
    .select("author_id")
    .in("author_id", authorIds);

  if (error) {
    console.error("Error fetching books count:", error);
    return authors;
  }

  // Count books by author
  const counts: Record<string, number> = {};

  books.forEach(({ author_id }) => {
    counts[author_id] = (counts[author_id] ?? 0) + 1;
  });

  // Add book_count to each author
  return authors.map((author) => ({
    ...author,
    book_count: counts[author.id] ?? 0,
  }));
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
