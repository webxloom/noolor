"use client";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { BOOK_LANGUAGES } from "@/lib/constants/books";

export type EventsFilters = {
  eventStatus?: string;
  eventMode?: string;
};

type Props = {
  initialQuery?: string;
  initialFilters?: EventsFilters;
  onSearch?: (query: string) => void;
  onFiltersChange?: (filters: EventsFilters) => void;
};

export default function SearchAndFilter({
  initialQuery = "",
  initialFilters = {},
  onSearch,
  onFiltersChange,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<EventsFilters>(initialFilters);

  const { eventStatus, eventMode } = filters;

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
            placeholder="Search by title, venue, or event type"
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
            value={eventStatus ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                eventStatus: e.target.value || undefined,
              }))
            }
            className="w-1/2 rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Event Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

          <select
            value={eventMode ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                eventMode: e.target.value || undefined,
              }))
            }
            className="w-1/2 rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="all">All Modes</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
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
