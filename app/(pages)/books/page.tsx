"use client";
import { useMemo } from "react";
import { Search } from "lucide-react";

// Context / Hooks
import { BooksProvider } from "@/app/contexts/books-context";
import { useBooksList } from "@/app/hooks/books/use-books-list";
import { BookRecord } from "@/lib/db/books/books-queries";

// Components
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { BookCard, type Book } from "@/app/components/books/book-card";
import BooksSearch from "@/app/components/books/books-search";

export type BookListItem = Book & {
  authorId?: string;
};

function mapBookToListItem(book: BookRecord & { slug: string }): BookListItem {
  return {
    authorId: book.author_id ?? undefined,
    authorName: book.author_name ?? "Unknown author",
    publishedBy: book.publication_name ?? undefined,
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
  const booksList = useBooksList("all", "");
  const {
    books,
    filteredBooks,
    filters,
    setFilters,
    isLoading,
    loadError,
    handleSearchSubmit,
    handleClearFilters,
    activeFilterCount,
  } = booksList;

  const mappedFilteredBooks = useMemo(() => {
    return (filteredBooks ?? []).map((b) =>
      mapBookToListItem(b as BookRecord & { slug: string }),
    );
  }, [filteredBooks]);

  return (
    <BooksProvider value={booksList}>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="font-serif text-4xl font-bold mb-2">Books</h1>
            <p className="text-muted-foreground text-lg">
              Discover books published by writers on Noolor.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {mappedFilteredBooks.length} book
            {mappedFilteredBooks.length === 1 ? "" : "s"}
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
          {/* Search */}
          <BooksSearch
            handleSearchSubmit={handleSearchSubmit}
            handleClearFilters={handleClearFilters}
            filters={filters}
            setFilters={setFilters}
            books={books}
          />

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[320px] rounded-xl" />
                ))}
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {mappedFilteredBooks.map((book) => (
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
    </BooksProvider>
  );
}
