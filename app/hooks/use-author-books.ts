"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";

import { useToast } from "@/app/hooks/use-toast";
import { getAuthorByUserIdQuery } from "@/lib/db/authors/authors-queries";
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
  getAssetActionLabel,
  getBookStatus,
  mapBookToForm,
  matchesBookSearch,
  STATUS_FILTERS,
} from "@/app/components/authors/author-dashboard/books/shared";

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

export function useAuthorBooks(user: { id: string; name: string }) {
  const { toast } = useToast();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [authorId, setAuthorId] = useState<string | null>(null);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBooks() {
      setIsLoading(true);
      setLoadError(null);

      const authorResult = await getAuthorByUserIdQuery(supabase, user.id);

      if (!isMounted) {
        return;
      }

      if (authorResult.error) {
        setLoadError(authorResult.error.message);
        setIsLoading(false);
        return;
      }

      if (!authorResult.data) {
        setAuthorId(null);
        setBooks([]);
        setIsLoading(false);
        return;
      }

      setAuthorId(authorResult.data.id);

      const booksResult = await getBooksByAuthorIdQuery(
        supabase,
        authorResult.data.id,
      );

      if (!isMounted) {
        return;
      }

      if (booksResult.error) {
        setLoadError(booksResult.error.message);
        setBooks([]);
      } else {
        setBooks(booksResult.data ?? []);
      }

      setIsLoading(false);
    }

    void loadBooks();

    return () => {
      isMounted = false;
    };
  }, [supabase, user.id]);

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
    setQuoteInput("");
    setEditorSection("details");
    setAssetFiles(emptyAssetFiles());
    setActiveTab("editor");
  }

  function addQuote() {
    const nextQuote = quoteInput.trim();

    if (!nextQuote) {
      return;
    }

    setForm((current) => ({
      ...current,
      quotes: [...current.quotes, nextQuote],
    }));
    setQuoteInput("");
  }

  function removeQuote(index: number) {
    setForm((current) => ({
      ...current,
      quotes: current.quotes.filter((_, quoteIndex) => quoteIndex !== index),
    }));
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
      toast({
        title: "Invalid file type",
        description: `Please choose an image file for the ${getAssetActionLabel(field)}.`,
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setAssetFiles((current) => ({ ...current, [field]: file }));
    setField(field, URL.createObjectURL(file));
    toast({
      title: "File selected",
      description: `The ${getAssetActionLabel(field)} will upload when you save the book.`,
    });
    event.target.value = "";
  }

  function clearAsset(field: BookAssetField) {
    setAssetFiles((current) => ({ ...current, [field]: null }));
    setField(field, "");
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authorId) {
      toast({
        title: "Author profile required",
        description:
          "Create the writer profile first so books can be linked to an author.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const pendingQuote = quoteInput.trim();
      let nextForm = {
        ...form,
        quotes: pendingQuote
          ? [...form.quotes, pendingQuote].filter(Boolean)
          : form.quotes,
      };

      for (const field of Object.keys(assetFiles) as BookAssetField[]) {
        const pendingFile = assetFiles[field];

        if (!pendingFile) {
          continue;
        }

        const uploadedUrl = await uploadBookAsset(
          supabase,
          user.id,
          pendingFile,
          `${field}-${
            form.title
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-") || "book"
          }`,
        );

        nextForm = { ...nextForm, [field]: uploadedUrl };
      }

      const payload = buildBookPayload(authorId, nextForm);
      const result = editingBookId
        ? await updateBookQuery(supabase, editingBookId, payload)
        : await createBookQuery(supabase, payload);

      if (result.error || !result.data) {
        throw result.error ?? new Error("Failed to save book.");
      }

      setBooks((current) => {
        const remaining = current.filter((book) => book.id !== result.data.id);
        return [result.data, ...remaining];
      });

      toast({
        title: editingBookId ? "Book updated" : "Book created",
        description: "The book record has been saved to Supabase.",
      });

      resetEditor();
      setActiveTab("catalog");
    } catch (error) {
      toast({
        title: "Unable to save book",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(book: BookRecord) {
    const confirmed = window.confirm(
      `Delete \"${book.title}\" from the books table?`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingId(book.id);

    try {
      const { error } = await deleteBookQuery(supabase, book.id);

      if (error) {
        throw error;
      }

      setBooks((current) => current.filter((item) => item.id !== book.id));

      if (editingBookId === book.id) {
        resetEditor();
      }

      toast({
        title: "Book deleted",
        description: "The book row was removed from Supabase.",
      });
    } catch (error) {
      toast({
        title: "Unable to delete book",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  }

  const filteredBooks = books.filter((book) => {
    const status = getBookStatus(book);
    const matchesStatus = filter === "all" ? true : status === filter;
    return matchesStatus && matchesBookSearch(book, search);
  });

  const statusCounts = STATUS_FILTERS.reduce<Record<BookStatus, number>>(
    (accumulator, statusFilter) => {
      accumulator[statusFilter.value] =
        statusFilter.value === "all"
          ? books.length
          : books.filter((book) => getBookStatus(book) === statusFilter.value)
              .length;
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
    startCreate,
    startEdit,
    statusCounts,
    user,
  };
}
