"use client";
import { useEffect } from "react";
import BooksEditor from "../../authors/author-dashboard/books/book-editor";
import { AuthorBooksProvider } from "@/app/contexts/books-context";
import { useAuthorBooks } from "@/app/hooks/author/use-author-books";

type Props = {
  book: any;
  open: boolean;
  onClose: () => void;
};

export default function BookDetailsDrawer({ book, open, onClose }: Props) {
  const authorId = book?.author_id ?? book?.publication_id;
  const isPublication = !!book?.publication_id;
  const bookId = book.id;
  const booksDetails = useAuthorBooks(authorId, isPublication);

  const { startEdit } = booksDetails;

  useEffect(() => {
    if (!open || !book) return;

    let mounted = true;

    if (bookId) {
      startEdit(book);
    }

    return () => {
      mounted = false;
    };
  }, [open, book]);

  if (!open) return null;

  return (
    <div className="h-full w-full overflow-auto">
      <div className="w-full p-4 border-b flex items-center justify-between bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold">Book Details</h2>
        <button
          onClick={onClose}
          className="text-sm text-gray-600 dark:text-gray-300"
        >
          Close
        </button>
      </div>

      <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
        <AuthorBooksProvider value={booksDetails}>
          <BooksEditor bookId={book.id} action="edit" onClose={() => false} />
        </AuthorBooksProvider>
      </div>
    </div>
  );
}
