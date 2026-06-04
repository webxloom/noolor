"use client";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

// Types / Queries
import {
  getPublishedBlogsQuery,
  type BlogRecord,
} from "@/lib/db/blogs/blogs-queries";

// Components
import { BlogCard, type Blog } from "@/app/components/blogs/blog-card";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import BlogsSearch from "@/app/components/blogs/blogs-search";

export type BlogListItem = Blog & {
  authorId?: string;
  createdAt?: string;
};

function mapBlogToListItem(
  blog: BlogRecord & { profile?: { name: string; avatar_url: string } },
): BlogListItem {
  return {
    authorName: blog?.profile?.name ?? "Unknown author",
    coverUrl: blog.cover_url ?? undefined,
    createdAt: blog.created_at ?? undefined,
    excerpt: blog.excerpt ?? undefined,
    id: blog.id,
    language: blog.language ?? "Unknown",
    publishedAt: blog.published_at ?? undefined,
    slug: blog.slug ?? blog.id,
    tags: Array.isArray(blog.tags) ? blog.tags : [],
    title: blog.title,
  };
}

function getPublishedDateBucket(value?: string) {
  if (!value) {
    return "unknown";
  }

  const publishedAt = new Date(value).getTime();
  const ageInDays = (Date.now() - publishedAt) / (1000 * 60 * 60 * 24);

  if (ageInDays <= 30) {
    return "last-30-days";
  }

  if (ageInDays <= 365) {
    return "last-year";
  }

  return "older";
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    debouncedSearch: "",
    author: "all",
    language: "all",
    tag: "all",
    dateRange: "all",
  });
  const { search, debouncedSearch, author, language, tag, dateRange } = filters;

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    async function loadBlogs() {
      setIsLoading(true);
      setLoadError(null);

      const { data: blogsResult, error: blogsError } =
        await getPublishedBlogsQuery(supabase);

      if (!isMounted) {
        return;
      }

      if (blogsError) {
        setLoadError(blogsError.message);
        setBlogs([]);
        setIsLoading(false);
        return;
      }

      setBlogs((blogsResult ?? []).map((blog) => mapBlogToListItem(blog)));
      setIsLoading(false);
    }

    void loadBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBlogs = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        blog.title.toLowerCase().includes(normalizedSearch) ||
        blog.authorName?.toLowerCase().includes(normalizedSearch) ||
        blog.excerpt?.toLowerCase().includes(normalizedSearch) ||
        blog.language.toLowerCase().includes(normalizedSearch) ||
        (blog.tags ?? []).some((item) =>
          item.toLowerCase().includes(normalizedSearch),
        );

      const matchesAuthor = author === "all" || blog.authorId === author;
      const matchesLanguage = language === "all" || blog.language === language;
      const matchesTag = tag === "all" || (blog.tags ?? []).includes(tag);
      const matchesDate =
        dateRange === "all" ||
        getPublishedDateBucket(blog.publishedAt) === dateRange;

      return (
        matchesSearch &&
        matchesAuthor &&
        matchesLanguage &&
        matchesTag &&
        matchesDate
      );
    });
  }, [author, blogs, dateRange, debouncedSearch, language, tag]);

  const activeFilterCount = [
    debouncedSearch.trim().length > 0,
    author !== "all",
    language !== "all",
    tag !== "all",
    dateRange !== "all",
  ].filter(Boolean).length;

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, debouncedSearch: search }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      debouncedSearch: "",
      author: "all",
      language: "all",
      tag: "all",
      dateRange: "all",
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-serif text-4xl font-bold">Blogs</h1>
          <p className="text-lg text-muted-foreground">
            Essays, reflections, and literary commentary from writers on Noolor.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredBlogs.length} blog{filteredBlogs.length === 1 ? "" : "s"}
          {activeFilterCount > 0
            ? ` matched across ${activeFilterCount} active filter${
                activeFilterCount > 1 ? "s" : ""
              }`
            : " available"}
        </div>
      </div>

      {loadError ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Search */}
        <BlogsSearch
          handleSearchSubmit={handleSearchSubmit}
          handleClearFilters={handleClearFilters}
          filters={filters}
          setFilters={setFilters}
          blogs={blogs}
        />

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[360px] rounded-xl" />
              ))}
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold">
                No blogs found
              </h3>
              <p className="mb-6 max-w-sm text-muted-foreground">
                We couldn&apos;t find any blogs matching your current filters.
                Try changing the author, tag, or date range.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
