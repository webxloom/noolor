"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";

import { BlogCard, type Blog } from "@/app/components/shared/blog-card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Skeleton } from "@/app/components/ui/skeleton";
import { getAuthorsQuery } from "@/lib/db/authors/authors-queries";
import {
  getPublishedBlogsQuery,
  type BlogRecord,
} from "@/lib/db/blogs/blogs-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { AuthorRecord } from "@/lib/types/authors";

type BlogListItem = Blog & {
  authorId?: string;
  createdAt?: string;
};

function mapBlogToListItem(
  blog: BlogRecord,
  authorsByUserId: Map<string, AuthorRecord>,
): BlogListItem {
  const author = authorsByUserId.get(blog.user_id);

  return {
    authorAvatar: author?.avatar_url ?? undefined,
    authorId: author?.id,
    authorName: author?.name ?? "Unknown author",
    authorSlug: author?.slug ?? undefined,
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [author, setAuthor] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    async function loadBlogs() {
      setIsLoading(true);
      setLoadError(null);

      const [blogsResult, authorsResult] = await Promise.all([
        getPublishedBlogsQuery(supabase),
        getAuthorsQuery(supabase),
      ]);

      if (!isMounted) {
        return;
      }

      if (blogsResult.error) {
        setLoadError(blogsResult.error.message);
        setBlogs([]);
        setIsLoading(false);
        return;
      }

      if (authorsResult.error) {
        setLoadError(authorsResult.error.message);
      }

      const authorsByUserId = new Map(
        (authorsResult.data ?? []).map((authorRecord) => [
          authorRecord.user_id,
          authorRecord,
        ]),
      );

      setBlogs(
        (blogsResult.data ?? []).map((blog) =>
          mapBlogToListItem(blog, authorsByUserId),
        ),
      );
      setIsLoading(false);
    }

    void loadBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const authorOptions = useMemo(() => {
    return Array.from(
      new Map(
        blogs
          .filter((blog) => blog.authorId && blog.authorName)
          .map((blog) => [blog.authorId as string, blog.authorName as string]),
      ),
    ).sort((left, right) => left[1].localeCompare(right[1]));
  }, [blogs]);

  const languageOptions = useMemo(() => {
    return Array.from(new Set(blogs.map((blog) => blog.language))).sort(
      (left, right) => left.localeCompare(right),
    );
  }, [blogs]);

  const tagOptions = useMemo(() => {
    return Array.from(new Set(blogs.flatMap((blog) => blog.tags ?? []))).sort(
      (left, right) => left.localeCompare(right),
    );
  }, [blogs]);

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
    setDebouncedSearch(search);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setAuthor("all");
    setLanguage("all");
    setTag("all");
    setDateRange("all");
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
        <aside className="w-full flex-shrink-0 space-y-6 lg:w-72">
          <div className="space-y-6 rounded-xl border bg-card p-5">
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Search className="h-4 w-4" /> Search
              </h3>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  placeholder="Titles, authors, tags..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="bg-background"
                />
                <Button type="submit" size="icon" variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Filter className="h-4 w-4" /> Filters
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author</label>
                  <Select value={author} onValueChange={setAuthor}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Authors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      {authorOptions.map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {languageOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tag</label>
                  <Select value={tag} onValueChange={setTag}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {tagOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Published</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any time</SelectItem>
                      <SelectItem value="last-30-days">Last 30 days</SelectItem>
                      <SelectItem value="last-year">Last year</SelectItem>
                      <SelectItem value="older">Older</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {(debouncedSearch ||
              author !== "all" ||
              language !== "all" ||
              tag !== "all" ||
              dateRange !== "all") && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </aside>

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
