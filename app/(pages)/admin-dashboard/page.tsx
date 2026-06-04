"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

import DashboardStatCard from "@/app/components/admin/dashboard/dashboardStatCard";
import TodayActivityCard from "@/app/components/admin/dashboard/todayActivityCard";

export default function AdminPage() {
  const [counts, setCounts] = useState({
    users: { total: 0, reader: 0, author: 0, publisher: 0 },
    books: { total: 0, author: 0, publisher: 0 },
    blogs: { total: 0 },
    events: { total: 0 },
    reviews: { total: 0 },
  });
  const [today, setToday] = useState({
    newUsers: 0,
    booksUploaded: 0,
    blogsPublished: 0,
    eventsCreated: 0,
    reviewsPosted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const supabase = createBrowserSupabaseClient();

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const isoStart = startOfDay.toISOString();

        // Total counts
        const [
          { count: usersCount },
          { count: booksCount },
          { count: blogsCount },
          { count: eventsCount },
          { count: reviewsCount },
        ] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact" }),
          supabase.from("books").select("id", { count: "exact" }),
          supabase.from("blogs").select("id", { count: "exact" }),
          supabase.from("events").select("id", { count: "exact" }),
          supabase
            .from("reader_library")
            .select("id", { count: "exact" })
            .not("review", "is", null),
        ]);

        // User Role counts
        const [
          { count: readerCount },
          { count: authorCount },
          { count: publisherCount },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "reader"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "writer"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "publication"),
        ]);

        // Today's counts
        const [
          { count: newUsers },
          { count: booksUploaded },
          { count: blogsPublished },
          { count: eventsCreated },
          { count: reviewsPosted },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .gte("created_at", isoStart),
          supabase
            .from("books")
            .select("id", { count: "exact" })
            .gte("created_at", isoStart),
          supabase
            .from("blogs")
            .select("id", { count: "exact" })
            .gte("created_at", isoStart),
          supabase
            .from("events")
            .select("id", { count: "exact" })
            .gte("created_at", isoStart),
          supabase
            .from("reader_library")
            .select("id", { count: "exact" })
            .gte("created_at", isoStart),
        ]);

        if (!mounted) return;

        setCounts({
          users: {
            total: usersCount ?? 0,
            reader: readerCount ?? 0,
            author: authorCount ?? 0,
            publisher: publisherCount ?? 0,
          },
          books: {
            total: booksCount ?? 0,
            author: authorCount ?? 0,
            publisher: publisherCount ?? 0,
          },
          blogs: { total: blogsCount ?? 0 },
          events: { total: eventsCount ?? 0 },
          reviews: { total: reviewsCount ?? 0 },
        });

        setToday({
          newUsers: newUsers ?? 0,
          booksUploaded: booksUploaded ?? 0,
          blogsPublished: blogsPublished ?? 0,
          eventsCreated: eventsCreated ?? 0,
          reviewsPosted: reviewsPosted ?? 0,
        });
      } catch (e) {
        console.error("Failed to fetch admin stats", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <DashboardStatCard counts={counts} loading={loading} />

      <TodayActivityCard activities={today} loading={loading} />
    </div>
  );
}
