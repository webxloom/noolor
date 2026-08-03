import { Loader2, Plus } from "lucide-react";

// Components
import { Button } from "@/app/components/ui/button";
import { CardTitle } from "@/app/components/ui/card";
import DetailsForm from "./detail-form";
import BookAssetsForm from "./assets-form";
import BookAwardsForm from "./awards-form";
import DeleteBook from "./delete-book";
import { useBookSubmit } from "@/app/hooks/books/use-book-submit";
import { useBooksContext } from "@/app/contexts/books-context";
import { useBookState } from "@/app/hooks/books/use-book-state";
import { useEffect } from "react";

export default function BookEditor({
  roleId,
  role,
  bookId,
  books,
  action,
  onClose,
}: {
  roleId: string | null;
  role: string;
  bookId?: string | null;
  books?: any[];
  action: string;
  onClose: () => void;
}) {
  const {
    form,
    setField,
    assetFiles,
    assetFileNames,
    handleAssetFileUpload,
    clearAsset,
    handleAwardFileChange,
    awardFiles,
    setForm,
    setAssetFiles,
    setAwardFiles,
    startEdit,
  } = useBookState({ bookId });

  const booksCtx = useBooksContext();
  const { books: ctxBooks, setBooks, editingBookId: ctxEditingId } = booksCtx;

  const { handleSubmit, handleDelete, isSaving, isLoading, isDeletingId } =
    useBookSubmit({
      form,
      assetFiles,
      awardFiles,
      roleId,
      role,
      bookId,
      books: ctxBooks,
      onSaveSuccess: onClose,
      setForm,
      setAssetFiles,
      setAwardFiles,
      setBooks,
    });

  // Sync when parent or context opens editor for a specific book id
  useEffect(() => {
    const idToEdit = bookId ?? ctxEditingId ?? null;
    if (idToEdit && ctxBooks) {
      const b = ctxBooks.find((x) => x.id === idToEdit);
      if (b) startEdit(b as any);
    }
  }, [bookId, ctxEditingId, ctxBooks, startEdit]);

  if (action === "delete") {
    return (
      <DeleteBook
        editingBookId={bookId ?? undefined}
        onClose={onClose}
        handleDelete={handleDelete}
        isDeletingId={isDeletingId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="font-serif text-2xl">
            {bookId ? "Edit book" : "Add new book"}
          </CardTitle>
        </div>
      </div>

      <div className="space-y-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Details */}
            <DetailsForm form={form} setField={setField} role={role} />

            <div className="space-y-4">
              {/* Assets */}
              <BookAssetsForm
                form={form}
                assetFileNames={assetFileNames}
                handleAssetFileUpload={handleAssetFileUpload}
                clearAsset={clearAsset}
                isSaving={isSaving}
              />

              {/* Awards */}
              <BookAwardsForm
                form={form}
                setField={setField}
                handleAwardFileChange={handleAwardFileChange}
                isSaving={isSaving}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSaving || !form.title.trim()}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {bookId ? "Save book" : "Create book"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
