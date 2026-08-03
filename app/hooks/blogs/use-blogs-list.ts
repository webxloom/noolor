"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  BlogRecord,
  getAllBlogsQuery,
  getBlogsByHostIdQuery,
} from "@/lib/db/blogs/blogs-queries";
import {
  getBlogStatus,
  matchesBlogSearch,
} from "@/app/components/blogs/shared";

export function useBlogsList(hostId: string | null, role: string = "all") {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    debouncedSearch: "",
    genre: "all",
    language: "all",
    isFree: "all",
  });
  const { search, debouncedSearch, genre, language, isFree } = filters;

  const [activeTab, setActiveTab] = useState("catalog");
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // debounce search -> debouncedSearch
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, debouncedSearch: f.search }));
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    async function loadBlogs() {
      setIsLoading(true);
      setLoadError(null);

      const blogsResult =
        role === "all"
          ? await getAllBlogsQuery(supabase)
          : await getBlogsByHostIdQuery(supabase, hostId ?? "");

      if (!isMounted) {
        return;
      }

      if (blogsResult.error) {
        setLoadError(blogsResult.error.message);
        setBlogs([]);
      } else {
        const data = blogsResult.data ?? [];
        setBlogs(Array.isArray(data) ? data : data ? [data] : []);
      }

      setIsLoading(false);
    }

    void loadBlogs();

    return () => {
      isMounted = false;
    };
  }, [supabase, hostId, role]);

  function resetEditor() {
    setEditingBlogId(null);
  }

  function startCreate() {
    resetEditor();
    setActiveTab("editor");
  }

  function startEdit(blog: BlogRecord) {
    setEditingBlogId(blog.id);
    setActiveTab("editor");
  }

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const status = getBlogStatus(blog);
      const matchesStatus = filters.genre === "all" || filters.genre === status;
      return matchesStatus && matchesBlogSearch(blog, search);
    });
  }, [blogs]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, debouncedSearch: prev.search }));
  }

  function handleClearFilters() {
    setFilters({
      search: "",
      debouncedSearch: "",
      genre: "all",
      language: "all",
      isFree: "all",
    });
  }

  const activeFilterCount = [
    debouncedSearch.trim().length > 0,
    genre !== "all",
    language !== "all",
    isFree !== "all",
  ].filter(Boolean).length;

  //   const handleSearchSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setFilters((prev) => ({ ...prev, debouncedSearch: search }));
  //   };

  //   const handleClearFilters = () => {
  //     setFilters({
  //       search: "",
  //       debouncedSearch: "",
  //       genre: "all",
  //       language: "all",
  //       isFree: "all",
  //     });
  //   };

  //   const activeFilterCount = [
  //     debouncedSearch.trim().length > 0,
  //     genre !== "all",
  //     language !== "all",
  //     isFree !== "all",
  //   ].filter(Boolean).length;

  return {
    activeTab,
    blogs,
    setBlogs,
    hostId: hostId ?? null,
    filters,
    setFilters,
    setActiveTab,
    editingBlogId,
    isLoading,
    loadError,
    startCreate,
    startEdit,
    resetEditor,
    filteredBlogs,
    handleSearchSubmit,
    handleClearFilters,
    activeFilterCount,
  };
}
