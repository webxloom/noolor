"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import { AuthorCard } from "@/app/components/shared/author-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { getAuthorsQuery } from "@/lib/db/authors/authors-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { AuthorRecord } from "@/lib/types/authors";

type AuthorListItem = {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  location?: string;
  bookCount: number;
  reviewCount: number;
  languages: string[];
  genres: string[];
};

function mapAuthorToListItem(author: AuthorRecord): AuthorListItem {
  return {
    avatarUrl: author.avatar_url ?? undefined,
    bookCount: 0,
    genres: author.genres ?? [],
    id: author.id,
    languages: author.languages ?? [],
    location: author.location ?? undefined,
    name: author.name,
    slug: author.slug,
    reviewCount: 0,
  };
}

export default function Authors() {
  const [authors, setAuthors] = useState<AuthorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [language, setLanguage] = useState<string>("all");
  const [genre, setGenre] = useState<string>("all");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    async function loadAuthors() {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await getAuthorsQuery(supabase);

      if (!isMounted) {
        return;
      }

      if (error) {
        setLoadError(error.message);
        setAuthors([]);
      } else {
        setAuthors((data ?? []).map(mapAuthorToListItem));
      }

      setIsLoading(false);
    }

    void loadAuthors();

    return () => {
      isMounted = false;
    };
  }, []);

  const languageOptions = useMemo(() => {
    return Array.from(
      new Set(authors.flatMap((author) => author.languages)),
    ).sort((left, right) => left.localeCompare(right));
  }, [authors]);

  const genreOptions = useMemo(() => {
    return Array.from(new Set(authors.flatMap((author) => author.genres))).sort(
      (left, right) => left.localeCompare(right),
    );
  }, [authors]);

  const filteredAuthors = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return authors.filter((author) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        author.name.toLowerCase().includes(normalizedSearch) ||
        author.location?.toLowerCase().includes(normalizedSearch) ||
        author.languages.some((item) =>
          item.toLowerCase().includes(normalizedSearch),
        ) ||
        author.genres.some((item) =>
          item.toLowerCase().includes(normalizedSearch),
        );

      const matchesLanguage =
        language === "all" || author.languages.includes(language);
      const matchesGenre = genre === "all" || author.genres.includes(genre);

      return matchesSearch && matchesLanguage && matchesGenre;
    });
  }, [authors, debouncedSearch, genre, language]);

  const activeFilterCount = [
    debouncedSearch.trim().length > 0,
    language !== "all",
    genre !== "all",
  ].filter(Boolean).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setLanguage("all");
    setGenre("all");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">Authors</h1>
          <p className="text-muted-foreground text-lg">
            Discover brilliant writers and their literary journeys.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredAuthors.length} author
          {filteredAuthors.length === 1 ? "" : "s"}
          {activeFilterCount > 0
            ? ` matched across ${activeFilterCount} active filter${activeFilterCount > 1 ? "s" : ""}`
            : " available"}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
          <div className="bg-card border rounded-xl p-5 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Search className="h-4 w-4" /> Search
              </h3>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  placeholder="Names..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-background"
                />
                <Button type="submit" size="icon" variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h3>
              <div className="space-y-4">
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
                  <label className="text-sm font-medium">Genre</label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      {genreOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {(debouncedSearch || language !== "all" || genre !== "all") && (
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
          {loadError ? (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {loadError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] rounded-xl" />
              ))}
            </div>
          ) : filteredAuthors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAuthors.map((author) => (
                <AuthorCard key={author.id} author={author} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card border-dashed">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">
                No authors found
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                We couldn&apos;t find any authors matching your current filters.
                Try adjusting your search or clearing filters.
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
