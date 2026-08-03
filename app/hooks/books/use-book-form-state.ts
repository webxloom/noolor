"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  type BookAssetField,
  type BookFormState,
  buildEmptyBookForm,
  mapBookToForm,
} from "@/app/components/books/shared";
import { BookRecord } from "@/lib/db/books/books-queries";
import { useToast } from "@/app/contexts/toast-context";

type AssetFilesState = Record<BookAssetField, File | null>;

const emptyAssetFiles = (): AssetFilesState => ({
  backCoverUrl: null,
  contentUrl: null,
  coverUrl: null,
});

export function useBookFormState({ bookId }: { bookId?: string | null }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("catalog");
  const [editorSection, setEditorSection] = useState("details");
  const [form, setForm] = useState<BookFormState>(buildEmptyBookForm);
  const [assetFiles, setAssetFiles] =
    useState<AssetFilesState>(emptyAssetFiles);
  const [awardFiles, setAwardFiles] = useState<(File | null)[]>([]);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const [supabase] = useState(() => createBrowserSupabaseClient());

  function setField<K extends keyof BookFormState>(
    field: K,
    value: BookFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const resetEditor = useCallback(() => {
    setEditingBookId(null);
    setForm(buildEmptyBookForm());
    setAssetFiles(emptyAssetFiles());
    setAwardFiles([]);
    setEditorSection("details");
  }, []);

  const startCreate = useCallback(() => {
    resetEditor();
    setActiveTab("editor");
  }, [resetEditor]);

  const startEdit = useCallback((book: BookRecord) => {
    setEditingBookId(book.id);
    setForm(mapBookToForm(book));
    setActiveTab("editor");
  }, []);

  useEffect(() => {
    if (!bookId || !supabase) return;

    let isMounted = true;

    async function loadBook() {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .eq("id", bookId)
          .single();
        if (!isMounted) return;
        if (error) throw error;
        if (data) {
          setForm(mapBookToForm(data));
          if (data.awards && Array.isArray(data.awards)) {
            setAwardFiles(new Array(data.awards.length).fill(null));
          }
        }
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Failed to load book",
          "error",
        );
      }
    }

    void loadBook();
    return () => {
      isMounted = false;
    };
  }, [bookId, supabase, addToast]);

  function handleAssetFileUpload(
    field: BookAssetField,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      (field === "coverUrl" || field === "backCoverUrl") &&
      !file.type.startsWith("image/")
    ) {
      addToast("Invalid file type", "info");
      event.target.value = "";
      return;
    }
    setAssetFiles((current) => ({ ...current, [field]: file }));
    setField(field as any, URL.createObjectURL(file) as any);
    event.target.value = "";
  }

  function clearAsset(field: BookAssetField) {
    setAssetFiles((current) => ({ ...current, [field]: null }));
    setField(field as any, "");
  }

  function handleAwardFileChange(index: number, file: File | null) {
    setAwardFiles((current) => {
      const next = [...current];
      next[index] = file;
      return next;
    });
  }

  return {
    activeTab,
    editorSection,
    form,
    setForm,
    assetFiles,
    awardFiles,
    editingBookId,
    setField,
    setActiveTab,
    setEditorSection,
    setAssetFiles,
    setAwardFiles,
    assetFileNames: {
      backCoverUrl: assetFiles.backCoverUrl?.name ?? null,
      contentUrl: assetFiles.contentUrl?.name ?? null,
      coverUrl: assetFiles.coverUrl?.name ?? null,
    },
    handleAssetFileUpload,
    clearAsset,
    handleAwardFileChange,
    resetEditor,
    startCreate,
    startEdit,
  };
}
