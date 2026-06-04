"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

// Contexts /Hooks
import { AuthorBooksProvider } from "@/app/contexts/books-context";
import { useAuthorBooks } from "@/app/hooks/author/use-author-books";

// Components
import AuthorExistingBooks from "./existing-books";
import BooksEditor from "./book-editor";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";

export function AuthorBooksTab({
  canEdit,
  authorId,
  isPublication,
}: {
  canEdit: boolean;
  authorId: any;
  isPublication: boolean;
}) {
  const booksDetails = useAuthorBooks(authorId, isPublication);
  const [showEditor, setShowEditor] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"create" | "edit" | "delete">(
    "create",
  );

  const {
    activeTab,
    books,
    editingBookId,
    isLoading,
    loadError,
    startCreate,
    startEdit,
  } = booksDetails;

  const editBooks = (action: string, bookId?: string) => {
    if (bookId) {
      const book = books.find((b) => b.id === bookId);
      if (book) {
        startEdit(book);
      } else {
        // fallback: just set id
        setBookToEdit(bookId);
      }
    } else {
      startCreate();
    }
    setShowEditor(true);
    setActionType(action as "create" | "edit" | "delete");
  };

  // Keep dialog state in sync with the hook/editor state so other components
  // that call `startEdit` directly will open this dialog.
  useEffect(() => {
    if (editingBookId || activeTab === "editor") {
      setBookToEdit(editingBookId);
      setShowEditor(true);
    } else {
      setShowEditor(false);
      setBookToEdit(null);
    }
  }, [editingBookId, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading books...
      </div>
    );
  }

  if (!authorId) {
    return (
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        No author profile was found for this user. Update bio and try again.
      </div>
    );
  }

  return (
    <AuthorBooksProvider value={booksDetails}>
      <div className="px-4 sm:px-6 lg:px-8 py-2 space-y-6">
        {loadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          {/* Total books */}
          <h1 className="font-serif text-2xl font-semibold">
            {books.length} {books.length === 1 ? "book" : "books"}
          </h1>

          {/* Add book */}
          {canEdit && (
            <Button
              type="button"
              className="shrink-0"
              onClick={() => editBooks("create")}
            >
              <Plus className="h-4 w-4" />
              Add new book
            </Button>
          )}
        </div>

        {/* Books list */}
        <AuthorExistingBooks onEdit={editBooks} canEdit={canEdit} />
      </div>

      {showEditor && (
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-3xl">
            <BooksEditor
              bookId={bookToEdit}
              action={actionType}
              onClose={setShowEditor}
            />
          </DialogContent>
        </Dialog>
      )}
    </AuthorBooksProvider>
  );
}
