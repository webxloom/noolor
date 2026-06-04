"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

// Contexts /Hooks
import { useAuthorEvents } from "@/app/hooks/author/use-author-events";
import { AuthorEventsProvider } from "@/app/contexts/events-context";

// Components
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import EventsEditor from "./events-editor";
import AuthorExistingEvents from "./existing-events";

export function AuthorEventsTab({
  canEdit,
  profileId,
}: {
  canEdit: boolean;
  profileId: any;
}) {
  const eventsDetails = useAuthorEvents(profileId);
  const [showEditor, setShowEditor] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"create" | "edit" | "delete">(
    "create",
  );

  const {
    activeTab,
    events,
    editingEventId,
    isLoading,
    loadError,
    startCreate,
    startEdit,
  } = eventsDetails;

  const editEvents = (action: string, eventId?: string) => {
    if (eventId) {
      const event = events.find((b) => b.id === eventId);
      if (event) {
        startEdit(event);
      } else {
        // fallback: just set id
        setEventToEdit(eventId);
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
    if (editingEventId || activeTab === "editor") {
      setEventToEdit(editingEventId);
      setShowEditor(true);
    } else {
      setShowEditor(false);
      setEventToEdit(null);
    }
  }, [editingEventId, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading Events...
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        No author profile was found for this user. Update bio and try again.
      </div>
    );
  }

  return (
    <AuthorEventsProvider value={eventsDetails}>
      <div className="px-4 sm:px-6 lg:px-8 py-2 space-y-6">
        {loadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          {/* Total events */}
          <h1 className="font-serif text-2xl font-semibold">
            {events.length} {events.length === 1 ? "event" : "events"}
          </h1>

          {/* Add event */}
          {canEdit && (
            <Button
              type="button"
              className="shrink-0"
              onClick={() => editEvents("create")}
            >
              <Plus className="h-4 w-4" />
              Add new event
            </Button>
          )}
        </div>

        {/* Books list */}
        <AuthorExistingEvents onEdit={editEvents} canEdit={canEdit} />
      </div>

      {showEditor && (
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-3xl">
            <EventsEditor
              eventId={eventToEdit}
              action={actionType}
              onClose={setShowEditor}
            />
          </DialogContent>
        </Dialog>
      )}
    </AuthorEventsProvider>
  );
}
