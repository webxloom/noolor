import { Loader2, Plus } from "lucide-react";
import { useEffect } from "react";

// Components
import { Button } from "@/app/components/ui/button";
import { CardTitle } from "@/app/components/ui/card";
import EventForm from "./event-form";
import DeleteEvent from "./delete-event";

import { useEventsContext } from "@/app/contexts/events-context";
import { useEventState } from "@/app/hooks/events/use-event-state";
import { useEventSubmit } from "@/app/hooks/events/use-event-submit";

export default function EventEditor({
  eventId,
  action,
  onClose,
}: {
  eventId?: string | null;
  action: string;
  onClose: (open: boolean) => void;
}) {
  const eventsCtx = useEventsContext();
  const { events, setEvents, hostId, editingEventId: ctxEditingId } = eventsCtx;

  const {
    form,
    setField,
    coverFile,
    handleCoverFileChange,
    clearCoverFile,
    resetEditor,
    startEdit,
  } = useEventState();

  const combinedResetEditor = () => {
    resetEditor();
    eventsCtx.resetEditor?.();
  };

  const { saveEvent, handleDelete, isSaving, isDeletingId } = useEventSubmit({
    hostId,
    events,
    setEvents,
    editingEventId: ctxEditingId ?? null,
    form,
    coverFile,
    resetEditor: combinedResetEditor,
  });

  const coverFileName = coverFile?.name ?? null;

  // Sync when parent opens editor for a specific event id
  useEffect(() => {
    const idToEdit = eventId ?? ctxEditingId ?? null;
    if (idToEdit && events) {
      const ev = events.find((x) => x.id === idToEdit);
      if (ev) startEdit(ev as any);
    }
  }, [eventId, ctxEditingId, events, startEdit]);

  if (action === "delete") {
    return (
      <DeleteEvent
        editingEventId={eventId ?? ctxEditingId ?? undefined}
        onClose={onClose}
        handleDelete={handleDelete}
        events={events}
        isDeletingId={isDeletingId}
      />
    );
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    void saveEvent();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="font-serif text-2xl">
            {eventId ? "Edit event" : "Add new event"}
          </CardTitle>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Details */}
        <EventForm
          form={form}
          setField={setField}
          coverFileName={coverFileName}
          clearCoverFile={clearCoverFile}
          handleCoverFileChange={handleCoverFileChange}
          isSaving={isSaving}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSaving || !form.title.trim()}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {ctxEditingId ? "Save event" : "Create event"}
          </Button>
          <Button type="button" variant="outline" onClick={combinedResetEditor}>
            Reset form
          </Button>
        </div>
      </form>
    </div>
  );
}
