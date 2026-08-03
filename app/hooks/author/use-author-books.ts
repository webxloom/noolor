"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import {
  createBookQuery,
  deleteBookQuery,
  getBooksByAuthorIdQuery,
  updateBookQuery,
  type BookRecord,
} from "@/lib/db/books/books-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

import {
  type BookAssetField,
  type BookFormState,
  type BookStatus,
  buildBookPayload,
  buildEmptyBookForm,
  getBookStatus,
  mapBookToForm,
  matchesBookSearch,
  STATUS_FILTERS,
} from "@/app/components/books/shared";
import { useToast } from "../../contexts/toast-context";

const authorImageBucket = process.env.SUPABASE_BUCKET_NAME ?? "noolor";
const bookAssetFolder = "books-images";

type AssetFilesState = Record<BookAssetField, File | null>;

const emptyAssetFiles = (): AssetFilesState => ({
  backCoverUrl: null,
  contentUrl: null,
  coverUrl: null,
});

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
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(authorImageBucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export function useAuthorBooks(
  authorId: string | null,
  isPublication: boolean,
) {
  const { addToast } = useToast();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [activeTab, setActiveTab] = useState("catalog");
  const [editorSection, setEditorSection] = useState("details");
  const [filter, setFilter] = useState<BookStatus>("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<BookFormState>(buildEmptyBookForm);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [quoteInput, setQuoteInput] = useState("");
  const [assetFiles, setAssetFiles] =
    useState<AssetFilesState>(emptyAssetFiles);
  const [awardsPendingFiles, setAwardsPendingFiles] = useState<(File | null)[]>(
    () => new Array(0).fill(null),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBooks() {
      setIsLoading(true);
      setLoadError(null);

      const booksResult = await getBooksByAuthorIdQuery(
        supabase,
        authorId ?? "",
      );

      if (!isMounted) {
        return;
      }

      if (booksResult.error) {
        setLoadError(booksResult.error.message);
        setBooks([]);
      } else {
        const data = booksResult.data;
        setBooks(Array.isArray(data) ? data : data ? [data] : []);
      }

      setIsLoading(false);
    }

    void loadBooks();

    return () => {
      isMounted = false;
    };
  }, [supabase, authorId]);

  function setField<K extends keyof BookFormState>(
    field: K,
    value: BookFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetEditor() {
    setEditingBookId(null);
    setForm(buildEmptyBookForm());
    setQuoteInput("");
    setEditorSection("details");
    setAssetFiles(emptyAssetFiles());
  }

  function startCreate() {
    resetEditor();
    setActiveTab("editor");
  }

  function startEdit(book: BookRecord) {
    setEditingBookId(book.id);
    setForm(mapBookToForm(book));
    setQuoteInput(
      (mapBookToForm(book).quotes && mapBookToForm(book).quotes[0]) || "",
    );
    setEditorSection("details");
    setAssetFiles(emptyAssetFiles());
    setActiveTab("editor");
  }

  function addQuote() {
    const nextQuote = quoteInput.trim();

    if (!nextQuote) {
      return;
    }

    // Replace quotes array with single quote
    setForm((current) => ({
      ...current,
      quotes: [nextQuote],
    }));
    setQuoteInput("");
  }

  function updateAward(
    index: number,
    field: keyof import("@/lib/types/authors").AwardFormItem,
    value: string,
  ) {
    setForm((current) => {
      const nextAwards = Array.isArray(current.awards)
        ? [...current.awards]
        : [];
      nextAwards[index] = { ...nextAwards[index], [field]: value } as any;
      return { ...current, awards: nextAwards };
    });
  }

  function addAward() {
    setForm((current) => ({
      ...current,
      awards: [...(current.awards ?? []), { title: "", year: "", fileUrl: "" }],
    }));
    setAwardsPendingFiles((current) => [...current, null]);
  }

  function removeAward(index: number) {
    setForm((current) => ({
      ...current,
      awards:
        !current.awards || current.awards.length <= 1
          ? [{ title: "", year: "", fileUrl: "" }]
          : current.awards.filter((_, i) => i !== index),
    }));
    setAwardsPendingFiles((current) =>
      current.length <= 1 ? [null] : current.filter((_, i) => i !== index),
    );
  }

  function handleAwardFileUpload(
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return null;
    }

    setAwardsPendingFiles((current) => {
      const next = [...current];
      next[index] = file;
      return next;
    });

    const blobUrl = URL.createObjectURL(file);
    setForm((current) => {
      const nextAwards = Array.isArray(current.awards)
        ? [...current.awards]
        : [];
      nextAwards[index] = { ...nextAwards[index], fileUrl: blobUrl } as any;
      return { ...current, awards: nextAwards };
    });
    event.target.value = "";
    return blobUrl;
  }

  function clearAwardFile(index: number) {
    setAwardsPendingFiles((current) => {
      const next = [...current];
      next[index] = null;
      return next;
    });
    setForm((current) => {
      const nextAwards = Array.isArray(current.awards)
        ? [...current.awards]
        : [];
      nextAwards[index] = { ...nextAwards[index], fileUrl: "" } as any;
      return { ...current, awards: nextAwards };
    });
  }

  function removeQuote(index: number) {
    // Clear all quotes (single-quote model)
    setForm((current) => ({ ...current, quotes: [] }));
    setQuoteInput("");
  }

  function handleAssetFileUpload(
    field: BookAssetField,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      (field === "coverUrl" || field === "backCoverUrl") &&
      !file.type.startsWith("image/")
    ) {
      addToast("Invalid file type", "info");
      event.target.value = "";
      return;
    }

    setAssetFiles((current) => ({ ...current, [field]: file }));
    setField(field, URL.createObjectURL(file));
    event.target.value = "";
  }

  function clearAsset(field: BookAssetField) {
    setAssetFiles((current) => ({ ...current, [field]: null }));
    setField(field, "");
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authorId) {
      addToast("Author profile required", "error");
      return;
    }

    setIsSaving(true);

    try {
      // If editing, fetch the original book to know previous asset URLs
      const originalBook = editingBookId
        ? (books.find((b) => b.id === editingBookId) ?? null)
        : null;

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

      const pathsToRemove: string[] = [];
      const pendingQuote = quoteInput.trim();
      let nextForm = {
        ...form,
        // For now we only support a single sample quote — replace the array when updated
        quotes: pendingQuote ? [pendingQuote].filter(Boolean) : form.quotes,
      };

      for (const field of Object.keys(assetFiles) as BookAssetField[]) {
        const pendingFile = assetFiles[field];

        if (!pendingFile) {
          continue;
        }

        const uploadedUrl = await uploadBookAsset(
          supabase,
          authorId,
          pendingFile,
          `${field}-${
            form.title
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-") || "book"
          }`,
        );

        nextForm = { ...nextForm, [field]: uploadedUrl };

        // If we're editing, schedule the previous file for removal
        if (originalBook) {
          const prevUrl =
            field === "coverUrl"
              ? originalBook.cover_url
              : field === "backCoverUrl"
                ? originalBook.back_cover_url
                : originalBook.content_url;

          const prevPath = extractStoragePath(prevUrl ?? null);
          const newPath = extractStoragePath(uploadedUrl ?? null);
          if (prevPath && prevPath !== newPath) {
            pathsToRemove.push(prevPath);
          }
        }
      }

      // Upload pending award files if any
      const nextAwards = Array.isArray(nextForm.awards)
        ? [...nextForm.awards]
        : [];
      for (let i = 0; i < (awardsPendingFiles.length || 0); i++) {
        const file = awardsPendingFiles[i];
        if (!file) continue;

        const extension = file.name.split(".").pop() ?? "jpg";
        const filePath = `${bookAssetFolder}/${authorId}/award-${Date.now()}-${i}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(authorImageBucket)
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from(authorImageBucket)
          .getPublicUrl(filePath);
        nextAwards[i] = { ...nextAwards[i], fileUrl: data.publicUrl } as any;
      }

      if (nextAwards.length > 0) {
        nextForm = { ...nextForm, awards: nextAwards };
      }

      const payload = buildBookPayload(authorId, nextForm, isPublication);

      let result: any;

      if (editingBookId) {
        const originalBook = books.find(
          (b) => b.id === (editingBookId as string),
        );

        if (originalBook) {
          const originalPayload = buildBookPayload(
            authorId,
            mapBookToForm(originalBook),
            isPublication,
          );

          const patch: Record<string, any> = {};
          for (const key of Object.keys(payload)) {
            const newVal = (payload as any)[key];
            const oldVal = (originalPayload as any)[key];

            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              patch[key] = newVal;
            }
          }

          // Don't attempt to change the owner relation on update
          delete patch.author_id;
          delete patch.publication_id;

          if (Object.keys(patch).length === 0) {
            addToast("No changes detected", "info");
            resetEditor();
            setActiveTab("catalog");
            return;
          }

          result = await updateBookQuery(supabase, editingBookId, patch);
        } else {
          // Fallback to full payload if original not found
          result = await updateBookQuery(supabase, editingBookId, payload);
        }
      } else {
        result = await createBookQuery(supabase, payload);
      }

      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        // Supabase sometimes returns success with null data (RLS/no-return); try to refetch the row
        try {
          const savedId = editingBookId ?? (result as any)?.data?.id;
          if (!savedId)
            throw new Error("No id available to refetch saved book.");

          const { data: fresh, error: freshErr } = await supabase
            .from("books")
            .select("*")
            .eq("id", savedId)
            .maybeSingle();

          if (freshErr) {
            throw freshErr;
          }

          if (!fresh) {
            throw new Error("Failed to retrieve saved book after update.");
          }

          result.data = fresh;
        } catch (refetchError) {
          throw refetchError;
        }
      }

      setBooks((current: any) => {
        const remaining = current.filter(
          (book: any) => book.id !== result?.data?.id,
        );
        return [result.data, ...remaining];
      });

      // After saving the book record, remove any replaced asset files
      if (pathsToRemove.length > 0) {
        const uniquePaths = Array.from(new Set(pathsToRemove));
        try {
          const { error: removeErr } = await supabase.storage
            .from(authorImageBucket)
            .remove(uniquePaths);

          if (removeErr) {
            addToast("Failed to remove some replaced stored files", "info");
          }
        } catch (err) {
          addToast("Failed to remove replaced stored files", "info");
        }
      }

      addToast(editingBookId ? "Book updated" : "Book created", "success");

      resetEditor();
      setActiveTab("catalog");
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "An unknown error occurred.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(book: BookRecord) {
    setIsDeletingId(book.id);

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

    try {
      // Collect storage paths for assets attached to this book
      const pathsToRemove: string[] = [];

      const coverPath = extractStoragePath(book.cover_url ?? null);
      const backPath = extractStoragePath(book.back_cover_url ?? null);
      const contentPath = extractStoragePath(book.content_url ?? null);

      if (coverPath) pathsToRemove.push(coverPath);
      if (backPath) pathsToRemove.push(backPath);
      if (contentPath) pathsToRemove.push(contentPath);

      if (Array.isArray(book.awards)) {
        for (const a of book.awards) {
          const p = extractStoragePath(a?.fileUrl ?? null);
          if (p) pathsToRemove.push(p);
        }
      }

      // De-duplicate
      const uniquePaths = Array.from(new Set(pathsToRemove));

      if (uniquePaths.length > 0) {
        try {
          const { error: removeErr } = await supabase.storage
            .from(authorImageBucket)
            .remove(uniquePaths);

          if (removeErr) {
            addToast("Failed to remove some stored files", "info");
          }
        } catch (err) {
          addToast("Failed to remove stored files", "info");
        }
      }

      const { error } = await deleteBookQuery(supabase, book.id);

      if (error) {
        throw error;
      }

      setBooks((current) => current.filter((item) => item.id !== book.id));

      if (editingBookId === book.id) {
        resetEditor();
      }

      addToast("Book deleted", "success");
    } catch (error) {
      addToast("Unable to delete book", "error");
    } finally {
      setIsDeletingId(null);
    }
  }

  const booksList = Array.isArray(books) ? books : [];

  const filteredBooks = booksList.filter((book) => {
    const status = getBookStatus(book);
    const matchesStatus = filter === "all" ? true : status === filter;
    return matchesStatus && matchesBookSearch(book, search);
  });

  const statusCounts = STATUS_FILTERS.reduce<Record<BookStatus, number>>(
    (accumulator, statusFilter) => {
      accumulator[statusFilter.value] =
        statusFilter.value === "all"
          ? booksList.length
          : booksList.filter(
              (book) => getBookStatus(book) === statusFilter.value,
            ).length;
      return accumulator;
    },
    { all: 0, draft: 0, free: 0, paid: 0, published: 0, upcoming: 0 },
  );

  return {
    activeTab,
    addQuote,
    assetFileNames: {
      backCoverUrl: assetFiles.backCoverUrl?.name ?? null,
      contentUrl: assetFiles.contentUrl?.name ?? null,
      coverUrl: assetFiles.coverUrl?.name ?? null,
    },
    authorId,
    books,
    clearAsset,
    editingBookId,
    editorSection,
    filteredBooks,
    filter,
    form,
    handleAssetFileUpload,
    handleDelete,
    handleSubmit,
    isDeletingId,
    isLoading,
    isSaving,
    loadError,
    quoteInput,
    removeQuote,
    resetEditor,
    search,
    setActiveTab,
    setEditorSection,
    setField,
    setFilter,
    setQuoteInput,
    setSearch,
    // awards helpers
    updateAward,
    addAward,
    removeAward,
    handleAwardFileUpload,
    clearAwardFile,
    setAwards: (next: any[]) =>
      setForm((current) => ({ ...current, awards: next })),
    pendingAwardFileNames: awardsPendingFiles.map((f) => f?.name ?? null),
    startCreate,
    startEdit,
    statusCounts,
  };
}
