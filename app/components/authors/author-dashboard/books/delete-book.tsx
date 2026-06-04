import { Button } from "@/app/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { useAuthorBooksContext } from "@/app/contexts/books-context";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteBook({
  editingBookId,
  onClose,
}: {
  editingBookId?: string;
  onClose: (deleted: boolean) => void;
}) {
  const { books, handleDelete, isDeletingId } = useAuthorBooksContext();

  const targetId = editingBookId ?? null;
  const bookToDelete = targetId ? books.find((b) => b.id === targetId) : null;

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>Confirm book deletion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Are you sure you want to delete this book? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => bookToDelete && handleDelete(bookToDelete)}
            disabled={!bookToDelete || isDeletingId === bookToDelete.id}
          >
            {isDeletingId === bookToDelete?.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Confirm deletion
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
