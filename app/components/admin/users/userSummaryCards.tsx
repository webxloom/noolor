"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import UserSummaryCard from "./userSummaryCard";
import { Users, User, UserCheck, Library } from "lucide-react";

export default function UserSummaryCards() {
  const [counts, setCounts] = useState({
    total: 0,
    readers: 0,
    authors: 0,
    publications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCounts() {
      try {
        const supabase = createBrowserSupabaseClient();

        const [totalRes, readersRes, writersRes, pubsRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact" }),
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("role", "reader"),
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("role", "writer"),
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("role", "publication"),
        ]);

        if (!mounted) return;

        const writers = writersRes.count ?? 0;

        setCounts({
          total: totalRes.count ?? 0,
          readers: readersRes.count ?? 0,
          authors: writers,
          publications: pubsRes.count ?? 0,
        });
      } catch (e) {
        console.error("Failed to fetch user summary counts", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchCounts();

    return () => {
      mounted = false;
    };
  }, []);

  const items = [
    {
      title: "Total Users",
      value: counts.total,
      icon: Users,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Readers",
      value: counts.readers,
      icon: User,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Authors",
      value: counts.authors,
      icon: UserCheck,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Publications",
      value: counts.publications,
      icon: Library,
      color: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <section aria-labelledby="users-summary" className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <UserSummaryCard
            key={it.title}
            title={it.title}
            value={loading ? "..." : it.value}
            icon={it.icon}
            color={it.color}
          />
        ))}
      </div>
    </section>
  );
}
