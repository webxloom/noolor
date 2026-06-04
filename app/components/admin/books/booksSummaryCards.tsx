"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { BookCopy, Book } from "lucide-react";
import UserSummaryCard from "../users/userSummaryCard";

export default function BooksSummaryCards() {
  const [counts, setCounts] = useState({
    total: 0,
    authors: 0,
    publications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCounts() {
      try {
        const supabase = createBrowserSupabaseClient();

        const [totalRes, writersRes, pubsRes] = await Promise.all([
          supabase.from("books").select("id", { count: "exact" }),
          supabase
            .from("books")
            .select("id", { count: "exact" })
            .not("author_id", "is", null),
          supabase
            .from("books")
            .select("id", { count: "exact" })
            .not("publication_id", "is", null),
        ]);

        if (!mounted) return;

        setCounts({
          total: totalRes.count ?? 0,
          authors: writersRes.count ?? 0,
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
      title: "Total Books",
      value: counts.total,
      icon: BookCopy,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Books from Authors",
      value: counts.authors,
      icon: Book,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Books from Publications",
      value: counts.publications,
      icon: Book,
      color: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <section aria-labelledby="users-summary" className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
