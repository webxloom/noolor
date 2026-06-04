"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { BlogRecord, getAllBlogsQuery } from "@/lib/db/blogs/blogs-queries";
import BlogsSummaryCards from "@/app/components/admin/blogs/blogsSummaryCards";
import SearchAndFilter, {
  BlogsFilters,
} from "@/app/components/admin/blogs/searchAndFilter";
import BlogsTable from "@/app/components/admin/blogs/blogs-table";
import BlogDetailsDrawer from "@/app/components/admin/blogs/blogDetailsDrawer";

type BlogRow = BlogRecord & {
  author?: {
    id: string;
    slug?: string;
    profile?: { name?: string; avatar_url?: string };
  } | null;
};

export default function ReviewsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<BlogsFilters>({});
  const [reviews, setReviews] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogRecord | null>(null);

  //   const fetchBlogs = useCallback(async (q: string, f: BlogsFilters) => {
  //     setLoading(true);

  //     try {
  //       const supabase = createBrowserSupabaseClient();
  //       const { data, error } = await getAllBlogsQuery(supabase, 100);

  //       if (error) {
  //         console.error("Error fetching blogs", error);
  //         setBlogs([]);
  //         return;
  //       }

  //       const trimmedQuery = q.trim().toLowerCase();

  //       const filteredBlogs = ((data ?? []) as BlogRow[]).filter((blog) => {
  //         const matchesQuery =
  //           !trimmedQuery ||
  //           blog.title?.toLowerCase().includes(trimmedQuery) ||
  //           blog.author?.profile?.name?.toLowerCase().includes(trimmedQuery) ||
  //           blog.author?.slug?.toLowerCase().includes(trimmedQuery);

  //         const matchesLanguage =
  //           !f?.language || f.language === "all" || blog.language === f.language;

  //         const matchesStatus =
  //           !f?.status ||
  //           (f.status === "draft" ? !blog.is_published : !!blog.is_published);

  //         return matchesQuery && matchesLanguage && matchesStatus;
  //       });

  //       setBlogs(filteredBlogs);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, []);

  //   useEffect(() => {
  //     fetchBlogs(query, filters);
  //   }, [query, filters]);

  return (
    <div className="space-y-6 p-4">
      <BlogsSummaryCards />

      {/* <SearchAndFilter
        initialQuery={query}
        initialFilters={filters}
        onSearch={(q) => setQuery(q)}
        onFiltersChange={(f) => setFilters(f)}
      />

      <BlogsTable
        blogs={blogs}
        loading={loading}
        onRowClick={(u) => setSelectedBlog(u)}
      />

      {selectedBlog ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedBlog(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-1/3 bg-white dark:bg-gray-900 shadow-lg z-50 overflow-auto">
            <BlogDetailsDrawer
              open={true}
              blog={selectedBlog}
              onClose={() => setSelectedBlog(null)}
            />
          </div>
        </>
      ) : null} */}
    </div>
  );
}
