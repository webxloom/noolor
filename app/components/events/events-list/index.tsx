"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

// Contexts /Hooks
import { useEventsList } from "@/app/hooks/events/use-events-list";
import { EventsProvider } from "@/app/contexts/events-context";

// Components
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import EventsListView from "./events-list-view";
import EventEditor from "../event-detail/event-editor";

export function EventsList({
  canEdit = false,
  role = "all",
  hostId,
}: {
  canEdit: boolean;
  role: string;
  hostId?: any;
}) {
  const eventsDetail = useEventsList(hostId ?? null, role);
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
    setActiveTab,
    startCreate,
    startEdit,
  } = eventsDetail;

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

  if (!hostId) {
    return (
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        No author profile was found for this user. Update bio and try again.
      </div>
    );
  }

  return (
    <EventsProvider value={eventsDetail}>
      <div className="px-4 sm:px-6 lg:px-8 py-2 space-y-6">
        {loadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          {/* Total Events */}
          <h1 className="font-serif text-2xl font-semibold">
            {events.length} {events.length === 1 ? "event" : "Events"}
          </h1>

          {/* Add book */}
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

        {/* EventsList */}
        <EventsListView events={events} canEdit={canEdit} onEdit={editEvents} />
      </div>

      {showEditor && (
        <Dialog
          open={showEditor}
          onOpenChange={setShowEditor}
          className="overflow-auto"
        >
          <DialogContent className="max-w-3xl overflow-auto">
            <EventEditor
              eventId={eventToEdit}
              action={actionType}
              onClose={() => setShowEditor(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </EventsProvider>
  );
}
