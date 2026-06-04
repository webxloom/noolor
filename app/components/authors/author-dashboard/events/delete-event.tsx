import { Button } from "@/app/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { useAuthorEventsContext } from "@/app/contexts/events-context";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteEvent({
  editingEventId,
  onClose,
}: {
  editingEventId?: string;
  onClose: (deleted: boolean) => void;
}) {
  const { events, handleDelete, isDeletingId } = useAuthorEventsContext();

  const targetId = editingEventId ?? null;
  const eventToDelete = targetId ? events.find((b) => b.id === targetId) : null;

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>Confirm event deletion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Are you sure you want to delete this event? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => eventToDelete && handleDelete(eventToDelete)}
            disabled={!eventToDelete || isDeletingId === eventToDelete.id}
          >
            {isDeletingId === eventToDelete?.id ? (
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
