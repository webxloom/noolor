import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

import { useAuthorBooksContext } from "@/app/contexts/books-context";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function AuthorExistingBooks({
  onEdit,
  canEdit,
}: {
  onEdit: (actionType: string, bookId?: string) => void;
  canEdit: boolean;
}) {
  const { books } = useAuthorBooksContext();

  const ITEMS_PER_PAGE = 9;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);

  const paginatedBooks = books.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No books added yet.{" "}
          {canEdit ? "Click the button above to add your first book." : ""}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedBooks.map((book) => {
              return (
                <div
                  key={book.id}
                  className="group relative overflow-hidden rounded-xl border shadow-sm aspect-[3/3.4] w-full"
                >
                  <Image
                    src={book.cover_url || "/images/book-placeholder.png"}
                    alt={book.title ?? "Book cover"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />

                  {/* Overlay on image to navigate to book detail page (visible on hover) */}
                  <Link
                    href={`/books/${book.slug}`}
                    className="absolute inset-0 z-20 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                  >
                    <div className="rounded-md bg-black/60 px-3 py-2 text-sm font-medium text-white pointer-events-auto">
                      View book details
                    </div>
                  </Link>

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-2 backdrop-blur-sm z-30">
                    <h3 className="line-clamp-1 text-sm font-medium text-white">
                      {book.title}
                    </h3>

                    {canEdit && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit("edit", book.id)}
                        >
                          <Pencil className="h-4 w-4 text-white" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit("delete", book.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
