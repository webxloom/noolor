"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Newspaper } from "lucide-react";
import UserSummaryCard from "../users/userSummaryCard";

export default function BlogsSummaryCards() {
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

        const { data: totalRes, error } = await supabase.from("blogs").select(
          `
          id,
          author:profiles!blogs_author_id_fkey(role)
          `,
          { count: "exact" },
        );

        if (error) {
          console.error("Error fetching blogs:", error);
          return;
        }

        const roleCounts: Record<string, number> = {};

        totalRes?.forEach((blog) => {
          const profiles = Array.isArray(blog.author)
            ? blog.author
            : [blog.author];

          profiles.forEach((profile) => {
            if (!profile) return;

            profile.role?.forEach((role: string) => {
              roleCounts[role] = (roleCounts[role] ?? 0) + 1;
            });
          });
        });

        if (!mounted) return;

        setCounts({
          total: totalRes?.length ?? 0,
          authors: roleCounts["writer"] ?? 0,
          publications: roleCounts["publication"] ?? 0,
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
      title: "Total Blogs",
      value: counts.total,
      icon: Newspaper,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Blogs from Authors",
      value: counts.authors,
      icon: Newspaper,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Blogs from Publications",
      value: counts.publications,
      icon: Newspaper,
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
