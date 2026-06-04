"use client";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

type Role = "writer" | "publication" | "all";
type Status = "verified" | "unverified" | "added" | "invited" | "all";
type CreatedBy = "admin" | "others" | "all";

export type InvitesFilters = {
  role?: Role;
  status?: Status;
  createdBy?: CreatedBy;
};

type Props = {
  initialQuery?: string;
  initialFilters?: InvitesFilters;
  onSearch?: (query: string) => void;
  onFiltersChange?: (filters: InvitesFilters) => void;
  handleAddInvite?: () => void;
};

export default function SearchAndFilter({
  initialQuery = "",
  initialFilters = {},
  onSearch,
  onFiltersChange,
  handleAddInvite,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<InvitesFilters>(initialFilters);

  const { role, status, createdBy } = filters;

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
    <div className="dark:bg-gray-800 dark:border-gray-700 flex flex-row items-center justify-between gap-4">
      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <label className="flex w-full items-center gap-2 rounded-md border px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone number"
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
            value={role ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                role: (e.target.value as Role) || undefined,
              }))
            }
            className="rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="all">All Roles</option>
            <option value="writer">Author</option>
            <option value="publication">Publication</option>
          </select>

          <select
            value={status ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: (e.target.value as Status) || undefined,
              }))
            }
            className="rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="added">Added</option>
            <option value="invited">Invited</option>
          </select>

          <select
            value={createdBy ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                createdBy: (e.target.value as CreatedBy) || undefined,
              }))
            }
            className="rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="all">All Invitations</option>
            <option value="admin">Invited by Admin</option>
            <option value="others">Invited by Others</option>
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

      {/* Add Users */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleAddInvite}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add Users
        </button>
      </div>
    </div>
  );
}
