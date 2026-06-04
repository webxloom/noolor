import { Loader2, Plus } from "lucide-react";

import { useAuthorEventsContext } from "@/app/contexts/events-context";

// Components
import { Button } from "@/app/components/ui/button";
import { CardTitle } from "@/app/components/ui/card";
import EventDetails from "./event-details";
import DeleteEvent from "./delete-event";

export default function EventsEditor({
  eventId,
  action,
  onClose,
}: {
  eventId?: string | null;
  action: string;
  onClose: (open: boolean) => void;
}) {
  const {
    editingEventId,
    form,
    handleSubmit,
    isSaving,
    resetEditor,
    setField,
    coverFileName,
    clearCoverFile,
    handleCoverFileChange,
  } = useAuthorEventsContext();

  if (action === "delete") {
    return (
      <DeleteEvent
        editingEventId={eventId ?? editingEventId ?? undefined}
        onClose={onClose}
      />
    );
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
        <EventDetails
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
            {editingEventId ? "Save event" : "Create event"}
          </Button>
          <Button type="button" variant="outline" onClick={resetEditor}>
            Reset form
          </Button>
        </div>
      </form>
    </div>
  );
}
