"use client";

import { useCallback, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  buildBookPayload,
  buildEmptyBookForm,
  mapBookToForm,
} from "@/app/components/books/shared";
import type { BookRecord } from "@/lib/db/books/books-queries";
import type { Dispatch, SetStateAction } from "react";
import {
  createBookQuery,
  updateBookQuery,
  deleteBookQuery,
} from "@/lib/db/books/books-queries";
import { useToast } from "@/app/contexts/toast-context";

const authorImageBucket = process.env.SUPABASE_BUCKET_NAME ?? "noolor";
const bookAssetFolder = "books-images";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "bin") : "bin";
}

async function uploadBookAsset(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  file: File,
  fileNamePrefix: string,
) {
  const extension = getFileExtension(file.name);
  const filePath = `${bookAssetFolder}/${userId}/${fileNamePrefix}-${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(authorImageBucket)
    .upload(filePath, file, { cacheControl: "3600", upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(authorImageBucket)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

async function uploadAwardFile(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  file: File,
  index: number,
) {
  const extension = getFileExtension(file.name);
  const filePath = `${bookAssetFolder}/${userId}/award-${Date.now()}-${index}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(authorImageBucket)
    .upload(filePath, file, { cacheControl: "3600", upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(authorImageBucket)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

export function useBookSubmit({
  form,
  assetFiles,
  awardFiles,
  roleId,
  role,
  bookId,
  books,
  onSaveSuccess,
  setForm,
  setAssetFiles,
  setAwardFiles,
  setBooks,
}: {
  form: any;
  assetFiles: Record<string, File | null>;
  awardFiles: (File | null)[];
  roleId?: string | null;
  role?: string;
  bookId?: string | null;
  books?: any[];
  onSaveSuccess?: () => void;
  setForm: (f: any) => void;
  setAssetFiles: (f: any) => void;
  setAwardFiles: (f: any) => void;
  setBooks?: Dispatch<SetStateAction<BookRecord[]>>;
}) {
  const { addToast } = useToast();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  function extractStoragePath(url?: string | null) {
    if (!url) return null;
    const marker = `/${authorImageBucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    let path = url.substring(idx + marker.length);
    const q = path.indexOf("?");
    if (q !== -1) path = path.substring(0, q);
    return decodeURIComponent(path);
  }

  const handleSubmit = useCallback(
    async (event: any) => {
      event?.preventDefault?.();
      if (!roleId) {
        addToast("Profile required", "error");
        return;
      }
      if (!form.title?.trim()) {
        addToast("Book title is required", "error");
        return;
      }

      setIsSaving(true);
      try {
        let nextForm = { ...form } as any;

        const pathsToRemove: string[] = [];

        // Upload asset files
        for (const field of Object.keys(assetFiles) as string[]) {
          const pendingFile = assetFiles[field];
          if (!pendingFile) continue;
          const uploadedUrl = await uploadBookAsset(
            supabase,
            roleId!,
            pendingFile,
            `${field}-${
              form.title
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-") || "book"
            }`,
          );
          nextForm[field] = uploadedUrl;

          // if updating, capture previous path to remove
          if (bookId && books) {
            const originalBook = books.find((b) => b.id === bookId);
            if (originalBook) {
              const prevUrl =
                field === "coverUrl"
                  ? originalBook.cover_url
                  : field === "backCoverUrl"
                    ? originalBook.back_cover_url
                    : originalBook.content_url;
              const prevPath = extractStoragePath(prevUrl ?? null);
              const newPath = extractStoragePath(uploadedUrl ?? null);
              if (prevPath && prevPath !== newPath)
                pathsToRemove.push(prevPath);
            }
          }
        }

        // upload awards
        if (Array.isArray(nextForm.awards)) {
          const nextAwards = [...nextForm.awards];
          for (let i = 0; i < nextAwards.length; i++) {
            const pending = awardFiles[i];
            if (pending) {
              const uploaded = await uploadAwardFile(
                supabase,
                roleId!,
                pending,
                i,
              );
              nextAwards[i] = { ...nextAwards[i], fileUrl: uploaded };
            }
          }
          nextForm.awards = nextAwards;
        }

        // Auto-fill names when creating: prefer canonical names from the creator's profile
        if (!bookId && roleId) {
          try {
            if (role === "author") {
              const { data: profile, error: profileErr } = await supabase
                .from("profiles")
                .select("pen_name")
                .eq("id", roleId)
                .maybeSingle();
              if (!profileErr && profile?.pen_name) {
                nextForm.authorName = profile.pen_name;
                nextForm.author_id = roleId;
              }
            }

            if (role === "publication") {
              const { data: pub, error: pubErr } = await supabase
                .from("publications")
                .select("publication_name")
                .eq("id", roleId)
                .maybeSingle();
              if (!pubErr && pub?.publication_name) {
                nextForm.publicationName = pub.publication_name;
                nextForm.publication_id = roleId;
              }
            }
          } catch (err) {
            // ignore auto-fill failures; not critical
          }
        }

        const isPublication = role === "publication";
        const payload = buildBookPayload(roleId!, nextForm, isPublication);

        let result: any;
        if (bookId) {
          // update
          const originalBook = books?.find((b) => b.id === bookId);
          if (originalBook) {
            const originalPayload = buildBookPayload(
              roleId!,
              mapBookToForm(originalBook),
              isPublication,
            );
            const patch: Record<string, any> = {};
            for (const key of Object.keys(payload)) {
              const newVal = (payload as any)[key];
              const oldVal = (originalPayload as any)[key];
              if (JSON.stringify(newVal) !== JSON.stringify(oldVal))
                patch[key] = newVal;
            }
            delete patch.author_id;
            delete patch.publication_id;
            if (Object.keys(patch).length === 0) {
              addToast("No changes detected", "info");
              onSaveSuccess?.();
              return;
            }
            result = await updateBookQuery(supabase, bookId, patch);
          } else {
            result = await updateBookQuery(supabase, bookId, payload);
          }
        } else {
          // before creating, check if a book with same title + author/publication exists
          const titleTrim = (nextForm.title || "").trim();
          let existing: any = null;
          try {
            if (titleTrim) {
              if (nextForm.author_id) {
                const { data, error } = await supabase
                  .from("books")
                  .select("*")
                  .eq("title", titleTrim)
                  .eq("author_id", nextForm.author_id)
                  .limit(1)
                  .maybeSingle();
                if (!error && data) existing = data;
              } else if (nextForm.publication_id) {
                const { data, error } = await supabase
                  .from("books")
                  .select("*")
                  .eq("title", titleTrim)
                  .eq("publication_id", nextForm.publication_id)
                  .limit(1)
                  .maybeSingle();
                if (!error && data) existing = data;
              } else if (nextForm.authorName) {
                const { data, error } = await supabase
                  .from("books")
                  .select("*")
                  .eq("title", titleTrim)
                  .eq("author_name", (nextForm.authorName || "").trim())
                  .limit(1)
                  .maybeSingle();
                if (!error && data) existing = data;
              } else if (nextForm.publicationName) {
                const { data, error } = await supabase
                  .from("books")
                  .select("*")
                  .eq("title", titleTrim)
                  .eq(
                    "publication_name",
                    (nextForm.publicationName || "").trim(),
                  )
                  .limit(1)
                  .maybeSingle();
                if (!error && data) existing = data;
              }
            }
          } catch (err) {
            // ignore lookup errors; fallback to create
            console.log("Error checking for existing book:", err);
          }

          if (existing) {
            // update the found record instead of creating a duplicate
            const originalPayload = buildBookPayload(
              roleId!,
              mapBookToForm(existing),
              isPublication,
            );
            const patch: Record<string, any> = {};
            for (const key of Object.keys(payload)) {
              const newVal = (payload as any)[key];
              const oldVal = (originalPayload as any)[key];
              if (JSON.stringify(newVal) !== JSON.stringify(oldVal))
                patch[key] = newVal;
            }
            // never allow changing the original author ownership here
            delete patch.author_id;

            // If the current requester is a publication and the existing record
            // does not have a publication_id, allow setting it so the
            // publication can claim the book. Otherwise remove publication_id
            // from the patch to avoid changing ownership unintentionally.
            if (role === "publication") {
              if ((existing as any).publication_id == null && roleId) {
                // ensure publication_id is set to the publisher's id
                patch.publication_id = roleId;
              } else {
                // if publication_id already exists and differs, do not overwrite
                if (patch.publication_id && (existing as any).publication_id) {
                  delete patch.publication_id;
                }
              }
            } else {
              delete patch.publication_id;
            }

            if (Object.keys(patch).length === 0) {
              addToast("No changes detected", "info");
              onSaveSuccess?.();
              result = { data: existing };
            } else {
              result = await updateBookQuery(supabase, existing.id, patch);
            }
          } else {
            result = await createBookQuery(supabase, payload);
          }
        }

        if (result.error) throw result.error;

        // remove replaced paths
        if (pathsToRemove.length > 0) {
          const unique = Array.from(new Set(pathsToRemove));
          try {
            const { error: removeErr } = await supabase.storage
              .from(authorImageBucket)
              .remove(unique);
            if (removeErr)
              addToast("Failed to remove some replaced stored files", "info");
          } catch (err) {
            addToast("Failed to remove replaced stored files", "info");
          }
        }

        addToast(bookId ? "Book updated" : "Book created", "success");
        // update list if setter provided
        if (setBooks && result?.data) {
          setBooks((current) => {
            const remaining = current.filter(
              (item) => item.id !== result.data.id,
            );
            return [result.data, ...remaining];
          });
        }
        setForm(buildEmptyBookForm());
        setAssetFiles(() => ({
          backCoverUrl: null,
          contentUrl: null,
          coverUrl: null,
        }));
        setAwardFiles(() => []);
        onSaveSuccess?.();
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "An unknown error occurred.",
          "error",
        );
        console.log("Error submitting book form:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [
      awardFiles,
      assetFiles,
      bookId,
      books,
      form,
      onSaveSuccess,
      role,
      roleId,
      setAssetFiles,
      setAwardFiles,
      setForm,
      addToast,
    ],
  );

  const handleDelete = useCallback(
    async (bookIdToDelete: string) => {
      setIsDeletingId(bookIdToDelete);
      try {
        const { data: book, error: fetchErr } = await supabase
          .from("books")
          .select("*")
          .eq("id", bookIdToDelete)
          .maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!book) throw new Error("Book not found");

        const pathsToRemove: string[] = [];
        const coverPath = extractStoragePath((book as any).cover_url ?? null);
        const backPath = extractStoragePath(
          (book as any).back_cover_url ?? null,
        );
        const contentPath = extractStoragePath(
          (book as any).content_url ?? null,
        );
        if (coverPath) pathsToRemove.push(coverPath);
        if (backPath) pathsToRemove.push(backPath);
        if (contentPath) pathsToRemove.push(contentPath);

        if (Array.isArray((book as any).awards)) {
          for (const a of (book as any).awards) {
            const p = extractStoragePath(a?.fileUrl ?? null);
            if (p) pathsToRemove.push(p);
          }
        }

        const unique = Array.from(new Set(pathsToRemove));
        if (unique.length > 0) {
          try {
            const { error: removeErr } = await supabase.storage
              .from(authorImageBucket)
              .remove(unique);
            if (removeErr)
              addToast("Failed to remove some stored files", "info");
          } catch (err) {
            addToast("Failed to remove stored files", "info");
          }
        }

        const { error } = await deleteBookQuery(supabase, bookIdToDelete);
        if (error) throw error;

        // remove from list if setter provided
        if (setBooks)
          setBooks((current) =>
            current.filter((item) => item.id !== bookIdToDelete),
          );
        addToast("Book deleted", "success");
        onSaveSuccess?.();
      } catch (err) {
        addToast("Unable to delete book", "error");
      } finally {
        setIsDeletingId(null);
      }
    },
    [onSaveSuccess, addToast, supabase],
  );

  return {
    handleSubmit,
    handleDelete,
    isSaving,
    isLoading,
    isDeletingId,
    setIsLoading,
  };
}
