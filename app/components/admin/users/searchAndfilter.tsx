"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export type RoleFilter = "" | "reader" | "writer" | "publication";
export type StatusFilter = "" | "active" | "inactive";

export type UserFilters = {
  role?: RoleFilter;
  status?: StatusFilter;
};

type Props = {
  initialQuery?: string;
  initialFilters?: UserFilters;
  onSearch?: (query: string) => void;
  onFiltersChange?: (filters: UserFilters) => void;
};

export default function SearchAndFilter({
  initialQuery = "",
  initialFilters = {},
  onSearch,
  onFiltersChange,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState<RoleFilter>(initialFilters.role ?? "");
  const [status, setStatus] = useState<StatusFilter>(
    initialFilters.status ?? "",
  );

  // Debounce search callbacks
  useEffect(() => {
    const id = setTimeout(() => {
      onSearch?.(query.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  useEffect(() => {
    onFiltersChange?.({ role, status });
  }, [role, status]);

  const clear = () => {
    setQuery("");
    setRole("");
    setStatus("");
    onSearch?.("");
    onFiltersChange?.({});
  };

  const roleOptions = useMemo(
    () => [
      { value: "", label: "All Roles" },
      { value: "reader", label: "Reader" },
      { value: "writer", label: "Writer" },
      { value: "publication", label: "Publication" },
    ],
    [],
  );

  return (
    <div className="dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <label className="flex w-full items-center gap-2 rounded-md border px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, or username"
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
            value={role}
            onChange={(e) => setRole(e.target.value as RoleFilter)}
            className="w-1/2 rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="w-1/2 rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
