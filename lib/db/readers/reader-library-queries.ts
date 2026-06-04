import { ReaderLibraryRecord } from "@/app/hooks/reader/use-reader-library";
import { SupabaseClient } from "@supabase/supabase-js";

// Get reader library entries for a user
export async function getReaderLibraryEntries(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("reader_library")
    .select(`*, books(*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reader library entries:", error);
    return [];
  }

  return data as ReaderLibraryRecord[];
}

// Get a single reader library entry for a user and book
export async function getBookEntry(
  supabase: SupabaseClient,
  userId: string,
  bookId: string,
) {
  try {
    const { data, error } = await supabase
      .from("reader_library")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();

    if (error) throw error;
    return { data: data as ReaderLibraryRecord | null, error: null };
  } catch (error) {
    console.log("getEntry error", error);
    return { data: null, error };
  }
}

// Create new entry
export async function createReaderEntry(
  supabase: SupabaseClient,
  insertRow: any,
) {
  const { data, error } = await supabase
    .from("reader_library")
    .insert(insertRow)
    .select()
    .single();

  return { data: data as ReaderLibraryRecord, error };
}

// Update existing entry
export async function updateReaderEntry(
  supabase: SupabaseClient,
  entryId: string,
  patch: Partial<ReaderLibraryRecord>,
) {
  const { data, error } = await supabase
    .from("reader_library")
    .update(patch)
    .eq("id", entryId)
    .select()
    .single();

  return { data: data as ReaderLibraryRecord, error };
}

// Delete entry
export async function deleteReaderEntry(
  supabase: SupabaseClient,
  entryId: string,
) {
  const { error } = await supabase
    .from("reader_library")
    .delete()
    .eq("id", entryId);

  return { error };
}

// Get all likes and reviews for a book by id
export async function getBookLikesAndReviews(
  supabase: SupabaseClient,
  bookId: string,
) {
  // Get likes count
  const { count: likesCount, error: likesError } = await supabase
    .from("reader_library")
    .select("*", { count: "exact", head: true })
    .eq("book_id", bookId)
    .eq("is_favorite", true);

  // Get reviews with reader name
  const { data: reviews, error: reviewsError } = await supabase
    .from("reader_library")
    .select(
      `
      user_id,
      review,
      rating,
      created_at,
      profiles (
        id,
        name
      )
    `,
    )
    .eq("book_id", bookId)
    .not("review", "is", null)
    .order("created_at", { ascending: false });

  return {
    likesCount: likesCount ?? 0,
    reviews: reviews ?? [],
    error: likesError ?? reviewsError,
  };
}
