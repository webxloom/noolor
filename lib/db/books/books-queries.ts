import { createBrowserSupabaseClient } from "@/lib/supabase/client";
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
  quote?: string | null;
  is_free?: boolean | null;
  price?: number | null;
  page_count?: number | null;
  published_year?: number | null;
  content_url?: string | null;
  awards?: Record<string, any> | null;
  created_at?: string | null;
  author_name?: string | null;
  publication_name?: string | null;
  page_limit?: number | null;
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
    .order("created_at", { ascending: false });
}

// Get books with all details including author and publication info
export function getBooksWithDetailsQuery(
  supabase: SupabaseClient,
  limit: number = 100,
) {
  return supabase
    .from("books")
    .select(
      `*, author:authors(id,slug,profile:profiles(id,name,avatar_url)), publication:publications(id,slug,profile:profiles(id,name,avatar_url))`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getBooksByAuthorIdQuery(
  supabase: SupabaseClient,
  authorId: string,
) {
  return supabase
    .from("books")
    .select("*")
    .or(`author_id.eq.${authorId},publication_id.eq.${authorId}`)
    .order("created_at", { ascending: false });
}

// Get all books
export async function getAllBooksQuery(supabase: SupabaseClient) {
  return supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
}

// Get books by roleId and role (author or publication)
export async function getBooksByRoleIdQuery(
  supabase: SupabaseClient,
  roleId: string,
  role: string,
) {
  const roleColumn = role === "author" ? "author_id" : "publication_id";
  return supabase
    .from("books")
    .select("*")
    .eq(roleColumn, roleId)
    .order("created_at", { ascending: false });
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
  const { data: bookDetail, error } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<BookRecord>();

  if (error) {
    console.error("Error fetching book by slug:", error);
    return { data: null, error };
  }

  const authorId = bookDetail?.author_id;
  let authorDetail = null;
  if (authorId) {
    const { data: authorData, error: authorError } = await supabase
      .from("authors")
      .select(`*, profile:profiles(name, avatar_url)`)
      .eq("id", authorId)
      .maybeSingle();

    if (authorError) {
      console.error("Error fetching author by ID:", authorError);
      return { data: null, error: authorError };
    }

    authorDetail = authorData;
  }

  return {
    data: { book: bookDetail, author: authorDetail },
    error: null,
  };
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
    .maybeSingle<BookRecord>();
}

export async function deleteBookQuery(
  supabase: SupabaseClient,
  bookId: string,
) {
  return supabase.from("books").delete().eq("id", bookId);
}

// Check if an author has any books
export async function checkRolehasBooks(authorId: string) {
  const supabase = createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("books")
    .select("id")
    .or(`author_id.eq.${authorId},publication_id.eq.${authorId}`)
    .limit(1);

  if (error) {
    console.error("Error checking author books:", error);
    return false;
  }

  return data && data.length > 0;
}
