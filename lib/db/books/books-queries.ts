import type { SupabaseClient } from "@supabase/supabase-js";

export type BookRecord = {
  id: string;
  title: string;
  slug: string;
  author_id?: string | null;
  publication_id?: string | null;
  cover_url?: string | null;
  back_cover_url?: string | null;
  language?: string | null;
  genres?: string[] | null;
  description?: string | null;
  quotes?: string[] | null;
  is_free?: boolean | null;
  price?: number | null;
  page_count?: number | null;
  published_year?: number | null;
  content_url?: string | null;
  created_at?: string | null;
};

export type BookInsert = Omit<BookRecord, "created_at" | "id"> & {
  id?: string;
};

export type BookCreate = Omit<BookInsert, "slug">;

export type BookUpdate = Partial<Omit<BookInsert, "author_id">>;

export async function getBooksQuery(supabase: SupabaseClient) {
  return supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<BookRecord[]>();
}

export async function getBooksByAuthorIdQuery(
  supabase: SupabaseClient,
  authorId: string,
) {
  return supabase
    .from("books")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .returns<BookRecord[]>();
}

export async function createBookQuery(
  supabase: SupabaseClient,
  book: BookCreate,
) {
  return supabase.from("books").insert(book).select().single<BookRecord>();
}

export async function getBookBySlugQuery(
  supabase: SupabaseClient,
  slug: string,
) {
  return supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<BookRecord>();
}

export async function updateBookQuery(
  supabase: SupabaseClient,
  bookId: string,
  patch: BookUpdate,
) {
  return supabase
    .from("books")
    .update(patch)
    .eq("id", bookId)
    .select()
    .single<BookRecord>();
}

export async function deleteBookQuery(
  supabase: SupabaseClient,
  bookId: string,
) {
  return supabase.from("books").delete().eq("id", bookId);
}
