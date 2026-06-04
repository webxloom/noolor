"use client";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "../../contexts/toast-context";
import {
  createReaderEntry,
  deleteReaderEntry,
  getBookEntry,
  updateReaderEntry,
} from "@/lib/db/readers/reader-library-queries";

export type ReaderLibraryPayload = {
  shelf?: string; // want_to_read | currently_reading | completed_books
  progress?: number | null; // 0-100
  rating?: number | null; // 1-5
  review?: string | null;
  is_favorite?: boolean | null;
  started_at?: string | null; // ISO
  completed_at?: string | null; // ISO
  notes?: string | null;
};

export type ReaderLibraryRecord = {
  id: string;
  user_id: string;
  book_id: string;
  shelf: string;
  progress?: number | null;
  rating?: number | null;
  is_favorite?: boolean | null;
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  review?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export function useReaderLibrary() {
  const supabase = createBrowserSupabaseClient();
  const { addToast } = useToast();

  async function getEntry(userId: string, bookId: string) {
    try {
      const { data, error } = await getBookEntry(supabase, userId, bookId);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log("getEntry error", error);
      return { data: null, error };
    }
  }

  async function saveEntry(
    userId: string,
    bookId: string,
    payload: ReaderLibraryPayload,
  ) {
    // Accept partial payload and either update existing or create new
    try {
      const existingRes = await getEntry(userId, bookId);
      if (existingRes.error) throw existingRes.error;

      if (existingRes.data) {
        // update only provided fields
        const patch: any = {};
        const allowed = [
          "shelf",
          "progress",
          "rating",
          "review",
          "is_favorite",
          "started_at",
          "completed_at",
          "notes",
        ];
        for (const key of allowed) {
          if (Object.prototype.hasOwnProperty.call(payload, key)) {
            // @ts-ignore
            patch[key] =
              (payload as any)[key] === undefined
                ? null
                : (payload as any)[key];
          }
        }

        if (Object.keys(patch).length === 0) {
          return { data: existingRes.data, error: null };
        }

        const { data, error } = await updateReaderEntry(
          supabase,
          existingRes.data.id,
          patch,
        );

        if (error) throw error;
        addToast("Library updated", "success");
        return { data: data as ReaderLibraryRecord, error: null };
      }

      // create new entry
      const insertRow = {
        user_id: userId,
        book_id: bookId,
        shelf: payload.shelf ?? "want_to_read",
        progress: payload.progress ?? 0,
        rating: payload.rating ?? null,
        review: (payload as any).review ?? null,
        is_favorite: payload.is_favorite ?? false,
        started_at: payload.started_at ?? null,
        completed_at: payload.completed_at ?? null,
        notes: payload.notes ?? null,
      } as any;

      const { data, error } = await createReaderEntry(supabase, insertRow);

      if (error) throw error;
      addToast("Added to library", "success");
      return { data: data as ReaderLibraryRecord, error: null };
    } catch (error) {
      console.log("saveEntry error", error);
      addToast("Unable to update library", "error");
      return { data: null, error };
    }
  }

  async function deleteEntry(entryId: string) {
    try {
      const { error } = await deleteReaderEntry(supabase, entryId);
      if (error) throw error;
      addToast("Removed from library", "success");
      return { error: null };
    } catch (error) {
      console.error("deleteEntry error", error);
      addToast("Unable to remove from library", "error");
      return { error };
    }
  }

  return { getEntry, saveEntry, deleteEntry };
}
