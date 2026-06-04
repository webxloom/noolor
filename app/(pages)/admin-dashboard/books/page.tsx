"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import BooksSummaryCards from "@/app/components/admin/books/booksSummaryCards";
import SearchAndFilter, {
  BooksFilters,
} from "@/app/components/admin/books/searchAndFilter";
import BooksTable from "@/app/components/admin/books/books-table";
import {
  getBooksWithDetailsQuery,
  BookRecord,
} from "@/lib/db/books/books-queries";
import BookDetailsDrawer from "@/app/components/admin/books/bookDetailsDrawer";

type BookRow = BookRecord & {
  author?: {
    id: string;
    slug?: string;
    profile?: { id?: string; name?: string; avatar_url?: string };
  } | null;
  publication?: {
    id: string;
    slug?: string;
    profile?: { id?: string; name?: string; avatar_url?: string };
  } | null;
};

export default function BooksPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<BooksFilters>({});
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookRow | null>(null);

  const fetchBooks = useCallback(async (q: string, f: BooksFilters) => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();

      let builder = getBooksWithDetailsQuery(supabase, 100);

      const trimmed = q.trim();
      if (trimmed) {
        const esc = trimmed.replace(/%/g, "\\%");
        // Search book title and also author/publication names.
        // Find profiles matching the query, then authors/publications tied to those profiles.
        const { data: matchingProfiles } = await supabase
          .from("profiles")
          .select("id")
          .ilike("name", `%${esc}%`);

        const profileIds = (matchingProfiles ?? []).map((p: any) => p.id);

        let authorIds: string[] = [];
        let publicationIds: string[] = [];

        if (profileIds.length > 0) {
          const { data: authors } = await supabase
            .from("authors")
            .select("id")
            .in("profile_id", profileIds);
          authorIds = (authors ?? []).map((a: any) => a.id);

          const { data: pubs } = await supabase
            .from("publications")
            .select("id")
            .in("profile_id", profileIds);
          publicationIds = (pubs ?? []).map((p: any) => p.id);
        }

        const orParts: string[] = [];
        orParts.push(`title.ilike.%${esc}%`);
        if (authorIds.length > 0)
          orParts.push(`author_id.in.(${authorIds.join(",")})`);
        if (publicationIds.length > 0)
          orParts.push(`publication_id.in.(${publicationIds.join(",")})`);

        if (orParts.length === 1) {
          builder = builder.ilike("title", `%${esc}%`);
        } else {
          builder = builder.or(orParts.join(","));
        }
      }

      if (f?.language) {
        builder =
          f?.language === "all" ? builder : builder.eq("language", f.language);
      }

      if (f?.genre) {
        builder =
          f?.genre === "all" ? builder : builder.contains("genres", [f.genre]);
      }

      if (f?.accessibility) {
        builder =
          f.accessibility === "free"
            ? builder.eq("is_free", true)
            : builder.eq("is_free", false);
      }

      const { data, error } = await builder;
      if (error) {
        console.error("Error fetching users", error);
        setBooks([]);
      } else {
        setBooks((data ?? []) as BookRow[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks(query, filters);
  }, [query, filters]);

  return (
    <div className="space-y-6 p-4">
      <BooksSummaryCards />

      <SearchAndFilter
        initialQuery={query}
        initialFilters={filters}
        onSearch={(q) => setQuery(q)}
        onFiltersChange={(f) => setFilters(f)}
      />

      <BooksTable
        books={books}
        loading={loading}
        onRowClick={(u) => setSelectedBook(u)}
      />

      {selectedBook ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedBook(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-1/3 bg-white dark:bg-gray-900 shadow-lg z-50 overflow-auto">
            <BookDetailsDrawer
              open={true}
              book={selectedBook}
              onClose={() => setSelectedBook(null)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
