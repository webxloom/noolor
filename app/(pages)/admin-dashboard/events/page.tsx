"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { EventRecord, getAllEventsQuery } from "@/lib/db/events/events-queries";
import EventsSummaryCards from "@/app/components/admin/events/eventsSummaryCards";
import SearchAndFilter, {
  EventsFilters,
} from "@/app/components/admin/events/searchAndFilter";
import EventsTable from "@/app/components/admin/events/events-table";
import EventDetailsDrawer from "@/app/components/admin/events/eventDetailsDrawer";

type EventRow = EventRecord & {
  host?: {
    id: string;
    slug?: string;
    profile?: { name?: string; avatar_url?: string };
  } | null;
};

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<EventsFilters>({});
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  const fetchEvents = useCallback(async (q: string, f: EventsFilters) => {
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await getAllEventsQuery(supabase, 100);

      if (error) {
        console.error("Error fetching events", error);
        setEvents([]);
        return;
      }

      const trimmedQuery = q.trim().toLowerCase();

      const filteredEvents = ((data ?? []) as EventRow[]).filter((event) => {
        const matchesQuery =
          !trimmedQuery ||
          event.title?.toLowerCase().includes(trimmedQuery) ||
          event.host?.profile?.name?.toLowerCase().includes(trimmedQuery) ||
          event.host?.slug?.toLowerCase().includes(trimmedQuery);

        // eventStatus can be 'upcoming' or 'past'. Use start_at to determine.
        let matchesStatus = true;
        if (f?.eventStatus) {
          const now = new Date();
          const start = event.start_at ? new Date(event.start_at) : null;
          if (start) {
            if (f.eventStatus === "upcoming") matchesStatus = start >= now;
            else if (f.eventStatus === "past") matchesStatus = start < now;
          }
        }

        // eventMode filter: compare with event.event_mode
        let matchesMode = true;
        if (f?.eventMode && f.eventMode !== "all") {
          matchesMode = (event.event_mode ?? "") === f.eventMode;
        }

        return matchesQuery && matchesStatus && matchesMode;
      });

      setEvents(filteredEvents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(query, filters);
  }, [fetchEvents, query, filters]);

  return (
    <div className="space-y-6 p-4">
      <EventsSummaryCards />

      <SearchAndFilter
        initialQuery={query}
        initialFilters={filters}
        onSearch={(q) => setQuery(q)}
        onFiltersChange={(f) => setFilters(f)}
      />

      <EventsTable
        events={events}
        loading={loading}
        onRowClick={(u) => setSelectedEvent(u)}
      />

      {selectedEvent ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-1/3 bg-white dark:bg-gray-900 shadow-lg z-50 overflow-auto">
            <EventDetailsDrawer
              open={true}
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
