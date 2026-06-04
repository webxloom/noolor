"use client";

import { useCallback, useEffect, useState } from "react";
import UserSummaryCards from "@/app/components/admin/users/userSummaryCards";
import SearchAndFilter, {
  UserFilters,
} from "@/app/components/admin/users/searchAndfilter";
import UserDetailsDrawer from "@/app/components/admin/users/userDetailsDrawer";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import UsersTable from "@/app/components/admin/users/users-table";

type ProfileRow = {
  id: string;
  name: string;
  username: string;
  phone?: string | null;
  contact_email?: string | null;
  role?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<UserFilters>({});
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileRow | null>(null);

  const fetchUsers = useCallback(async (q: string, f: UserFilters) => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();

      let builder = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const trimmed = q.trim();
      if (trimmed) {
        const esc = trimmed.replace(/%/g, "\\%");
        builder = builder.or(
          `name.ilike.%${esc}%,phone.ilike.%${esc}%,username.ilike.%${esc}%`,
        );
      }

      if (f?.role) {
        builder = builder.eq("role", f.role);
      }

      if (f?.status) {
        builder = builder.eq("is_active", f.status === "active");
      }

      const { data, error } = await builder;
      if (error) {
        console.error("Error fetching users", error);
        setUsers([]);
      } else {
        setUsers((data ?? []) as ProfileRow[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(query, filters);
  }, [query, filters]);

  return (
    <div className="space-y-6 p-4">
      <UserSummaryCards />

      <SearchAndFilter
        initialQuery={query}
        initialFilters={filters}
        onSearch={(q) => setQuery(q)}
        onFiltersChange={(f) => setFilters(f)}
      />

      <UsersTable
        users={users}
        loading={loading}
        onRowClick={(u) => setSelectedUser(u)}
      />

      {selectedUser ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedUser(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-1/3 bg-white dark:bg-gray-900 shadow-lg z-50 overflow-auto">
            <UserDetailsDrawer
              open={true}
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
