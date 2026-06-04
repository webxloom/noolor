"use client";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { BOOK_GENRES, BOOK_LANGUAGES } from "@/lib/constants/books";

export type BooksFilters = {
  language?: any;
  genre?: any;
  accessibility?: "free" | "paid" | "";
};

type Props = {
  initialQuery?: string;
  initialFilters?: BooksFilters;
  onSearch?: (query: string) => void;
  onFiltersChange?: (filters: BooksFilters) => void;
};

export default function SearchAndFilter({
  initialQuery = "",
  initialFilters = {},
  onSearch,
  onFiltersChange,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<BooksFilters>(initialFilters);

  const { language, genre, accessibility } = filters;

  // Debounce search callbacks
  useEffect(() => {
    const id = setTimeout(() => {
      onSearch?.(query.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters]);

  const clear = () => {
    setQuery("");
    setFilters({});
    onSearch?.("");
    onFiltersChange?.({});
  };

  return (
    <div className="dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <label className="flex w-full items-center gap-2 rounded-md border px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author or publications"
            className="w-full bg-transparent text-sm outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="p-1"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          ) : null}
        </label>

        <div className="flex w-full items-center gap-3">
          <select
            value={language ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                language: e.target.value || undefined,
              }))
            }
            className="w-1/2 rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="all">All Languages</option>
            {BOOK_LANGUAGES.map((opt, index) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            value={genre ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                genre: e.target.value || undefined,
              }))
            }
            className="w-1/2 rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="all">All Genres</option>
            {BOOK_GENRES.map((opt, index) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            value={accessibility ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                accessibility:
                  (e.target.value as "free" | "paid" | "") || undefined,
              }))
            }
            className="w-1/2 rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Accesses</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={clear}
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
