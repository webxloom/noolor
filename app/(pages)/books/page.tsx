"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import { BookCard, type Book } from "@/app/components/shared/book-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { getAuthorsQuery } from "@/lib/db/authors/authors-queries";
import { getBooksQuery, type BookRecord } from "@/lib/db/books/books-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { AuthorRecord } from "@/lib/types/authors";

type BookListItem = Book & {
  authorId?: string;
};

function mapBookToListItem(
  book: BookRecord,
  authorsById: Map<string, AuthorRecord>,
): BookListItem {
  const author = book.author_id ? authorsById.get(book.author_id) : undefined;

  return {
    authorId: book.author_id ?? undefined,
    authorName: author?.name,
    authorSlug: author?.slug,
    coverUrl: book.cover_url ?? undefined,
    genre: book.genres?.[0] ?? "Uncategorized",
    id: book.id,
    isFree: book.is_free === true,
    language: book.language ?? "Unknown",
    price: book.price ?? undefined,
    rating: undefined,
    reviewCount: 0,
    slug: book.slug,
    title: book.title,
  };
}

export default function Books() {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [isFree, setIsFree] = useState<string>("all");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    async function loadBooks() {
      setIsLoading(true);
      setLoadError(null);

      const [booksResult, authorsResult] = await Promise.all([
        getBooksQuery(supabase),
        getAuthorsQuery(supabase),
      ]);

      if (!isMounted) {
        return;
      }

      if (booksResult.error) {
        setLoadError(booksResult.error.message);
        setBooks([]);
        setIsLoading(false);
        return;
      }

      if (authorsResult.error) {
        setLoadError(authorsResult.error.message);
      }

      const authorsById = new Map(
        (authorsResult.data ?? []).map((author) => [author.id, author]),
      );

      setBooks(
        (booksResult.data ?? []).map((book) =>
          mapBookToListItem(book, authorsById),
        ),
      );
      setIsLoading(false);
    }

    void loadBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  const languageOptions = useMemo(() => {
    return Array.from(new Set(books.map((book) => book.language))).sort(
      (left, right) => left.localeCompare(right),
    );
  }, [books]);

  const genreOptions = useMemo(() => {
    return Array.from(new Set(books.map((book) => book.genre))).sort(
      (left, right) => left.localeCompare(right),
    );
  }, [books]);

  const filteredBooks = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        book.title.toLowerCase().includes(normalizedSearch) ||
        book.authorName?.toLowerCase().includes(normalizedSearch) ||
        book.genre.toLowerCase().includes(normalizedSearch) ||
        book.language.toLowerCase().includes(normalizedSearch);

      const matchesGenre = genre === "all" || book.genre === genre;
      const matchesLanguage = language === "all" || book.language === language;
      const matchesPricing =
        isFree === "all" ||
        (isFree === "free" && book.isFree) ||
        (isFree === "paid" && !book.isFree);

      return matchesSearch && matchesGenre && matchesLanguage && matchesPricing;
    });
  }, [books, debouncedSearch, genre, language, isFree]);

  const activeFilterCount = [
    debouncedSearch.trim().length > 0,
    genre !== "all",
    language !== "all",
    isFree !== "all",
  ].filter(Boolean).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setGenre("all");
    setLanguage("all");
    setIsFree("all");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">Books</h1>
          <p className="text-muted-foreground text-lg">
            Discover books published by writers on Noolor.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredBooks.length} book{filteredBooks.length === 1 ? "" : "s"}
          {activeFilterCount > 0
            ? ` matched across ${activeFilterCount} active filter${activeFilterCount > 1 ? "s" : ""}`
            : " available"}
        </div>
      </div>

      {loadError ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
          <div className="bg-card border rounded-xl p-5 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Search className="h-4 w-4" /> Search
              </h3>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  placeholder="Titles, authors..."
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pricing</label>
                  <Select value={isFree} onValueChange={setIsFree}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {(debouncedSearch ||
              genre !== "all" ||
              language !== "all" ||
              isFree !== "all") && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[320px] rounded-xl" />
              ))}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card border-dashed">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">
                No books found
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                We couldn&apos;t find any books matching your current filters.
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
