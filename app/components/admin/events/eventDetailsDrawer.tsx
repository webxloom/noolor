"use client";
import { AuthorEventsProvider } from "@/app/contexts/events-context";
import { useEffect } from "react";
import EventsEditor from "../../authors/author-dashboard/events/events-editor";
import { useAuthorEvents } from "@/app/hooks/author/use-author-events";

type Props = {
  event: any;
  open: boolean;
  onClose: () => void;
};

export default function EventDetailsDrawer({ event, open, onClose }: Props) {
  const profileId = event?.host?.profile?.id;
  const eventId = event.id;
  const eventsDetail = useAuthorEvents(profileId);

  const { startEdit } = eventsDetail;

  useEffect(() => {
    if (!open || !event) return;

    let mounted = true;

    if (eventId) {
      startEdit(event);
    }

    return () => {
      mounted = false;
    };
  }, [open, event]);

  if (!open) return null;

  return (
    <div className="h-full w-full overflow-auto">
      <div className="w-full p-4 border-b flex items-center justify-between bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold">event Details</h2>
        <button
          onClick={onClose}
          className="text-sm text-gray-600 dark:text-gray-300"
        >
          Close
        </button>
      </div>

      <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
        <AuthorEventsProvider value={eventsDetail}>
          <EventsEditor
            eventId={event.id}
            action="edit"
            onClose={() => false}
          />
        </AuthorEventsProvider>
      </div>
    </div>
  );
}
