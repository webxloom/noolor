import { Button } from "@/app/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteBlog({
  editingBlogid,
  onClose,
  blogs,
  handleDelete,
  isDeletingId,
}: {
  editingBlogid?: string;
  onClose: (deleted: boolean) => void;
  blogs?: any[];
  handleDelete?: (blog: any) => void;
  isDeletingId?: string | null;
}) {
  const targetId = editingBlogid ?? null;
  const blogToDelete = targetId ? blogs?.find((b) => b.id === targetId) : null;

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>Confirm blog deletion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Are you sure you want to delete this blog? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => blogToDelete && handleDelete?.(blogToDelete)}
            disabled={!blogToDelete || isDeletingId === blogToDelete.id}
          >
            {isDeletingId === blogToDelete?.id ? (
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
