"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAllBooksQuery,
  getBooksByRoleIdQuery,
  type BookRecord,
} from "@/lib/db/books/books-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function useBooksList(role: string, roleId: string | null) {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    debouncedSearch: "",
    genre: "all",
    language: "all",
    isFree: "all",
  });
  const { search, debouncedSearch, genre, language, isFree } = filters;

  const [activeTab, setActiveTab] = useState("catalog");
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBooks() {
      setIsLoading(true);
      setLoadError(null);

      const booksResult =
        role === "all"
          ? await getAllBooksQuery(supabase)
          : await getBooksByRoleIdQuery(supabase, roleId ?? "", role);

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
  }, [supabase, roleId, role]);

  function resetEditor() {
    setEditingBookId(null);
  }

  function startCreate() {
    resetEditor();
    setActiveTab("editor");
  }

  function startEdit(book: BookRecord) {
    setEditingBookId(book.id);
    setActiveTab("editor");
  }

  const booksList = Array.isArray(books) ? books : [];

  const filteredBooks = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        book.title.toLowerCase().includes(normalizedSearch) ||
        book.author_name?.toLowerCase().includes(normalizedSearch) ||
        book.publication_name?.toLowerCase().includes(normalizedSearch) ||
        book.genres?.some((g) => g.toLowerCase().includes(normalizedSearch)) ||
        book.language?.toLowerCase().includes(normalizedSearch);

      const matchesGenre = genre === "all" || book.genres?.includes(genre);
      const matchesLanguage = language === "all" || book.language === language;
      const matchesPricing =
        isFree === "all" ||
        (isFree === "free" && book.is_free) ||
        (isFree === "paid" && !book.is_free);

      return matchesSearch && matchesGenre && matchesLanguage && matchesPricing;
    });
  }, [books, debouncedSearch, genre, language, isFree]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, debouncedSearch: search }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      debouncedSearch: "",
      genre: "all",
      language: "all",
      isFree: "all",
    });
  };

  const activeFilterCount = [
    debouncedSearch.trim().length > 0,
    genre !== "all",
    language !== "all",
    isFree !== "all",
  ].filter(Boolean).length;

  return {
    activeTab,
    books,
    setBooks,
    roleId: roleId ?? null,
    filteredBooks,
    filters,
    setFilters,
    activeFilterCount,
    setActiveTab,
    editingBookId,
    isLoading,
    loadError,
    startCreate,
    startEdit,
    handleSearchSubmit,
    handleClearFilters,
  };
}
