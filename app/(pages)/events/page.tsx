"use client";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

// Queries
import {
  getEventsQuery,
  type EventRecord,
} from "@/lib/db/events/events-queries";

// Components
import { EventCard, type Event } from "@/app/components/events/event-card";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import EventsSearch from "@/app/components/events/events-search";

export type EventListItem = Event & {
  authorId?: string;
  createdAt?: string;
};

function mapEventToListItem(
  event: EventRecord & { profile?: { name: string; avatar_url: string } },
): EventListItem {
  return {
    id: event.id,
    slug: event.slug ?? undefined,
    title: event.title,
    description: event.description ?? undefined,
    coverImage: event.cover_image ?? undefined,
    eventType: event.event_type,
    startAt: event.start_at,
    endAt: event.end_at ?? undefined,
    eventMode: event.event_mode,
    venueName: event.venue_name ?? undefined,
    venueAddress: event.venue_address ?? undefined,
    city: event.city ?? undefined,
    meetingUrl: event.meeting_url ?? undefined,
    status: event.status,
    createdAt: event.created_at ?? undefined,
    authorName: event?.profile?.name ?? undefined,
    authorSlug: event?.slug ?? undefined,
    authorAvatar: event?.profile?.avatar_url ?? undefined,
  };
}

function getPublishedDateBucket(value?: string) {
  if (!value) {
    return "unknown";
  }

  const publishedAt = new Date(value).getTime();
  const ageInDays = (Date.now() - publishedAt) / (1000 * 60 * 60 * 24);

  if (ageInDays <= 30) {
    return "last-30-days";
  }

  if (ageInDays <= 365) {
    return "last-year";
  }

  return "older";
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    debouncedSearch: "",
    author: "all",
    language: "all",
    tag: "all",
    dateRange: "all",
  });
  const { search, debouncedSearch, author, language, tag, dateRange } = filters;

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    async function loadevents() {
      setIsLoading(true);
      setLoadError(null);

      const { data: eventsResult, error: eventsError } =
        await getEventsQuery(supabase);
      if (!isMounted) {
        return;
      }

      if (eventsError) {
        setLoadError(eventsError.message);
        setEvents([]);
        setIsLoading(false);
        return;
      }

      setEvents((eventsResult ?? []).map((event) => mapEventToListItem(event)));
      setIsLoading(false);
    }

    void loadevents();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        (event.authorName?.toLowerCase().includes(normalizedSearch) ?? false);

      const matchesAuthor = author === "all" || event.authorId === author;
      const matchesDate =
        dateRange === "all" ||
        getPublishedDateBucket(event.createdAt) === dateRange;

      return matchesSearch && matchesAuthor && matchesDate;
    });
  }, [author, events, dateRange, debouncedSearch, language, tag]);

  const activeFilterCount = [
    debouncedSearch.trim().length > 0,
    author !== "all",
    language !== "all",
    tag !== "all",
    dateRange !== "all",
  ].filter(Boolean).length;

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, debouncedSearch: search }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      debouncedSearch: "",
      author: "all",
      language: "all",
      tag: "all",
      dateRange: "all",
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-serif text-4xl font-bold">Events</h1>
          <p className="text-lg text-muted-foreground">
            Essays, reflections, and literary commentary from writers on Noolor.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"}
          {activeFilterCount > 0
            ? ` matched across ${activeFilterCount} active filter${
                activeFilterCount > 1 ? "s" : ""
              }`
            : " available"}
        </div>
      </div>

      {loadError ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Search */}
        <EventsSearch
          handleSearchSubmit={handleSearchSubmit}
          handleClearFilters={handleClearFilters}
          filters={filters}
          setFilters={setFilters}
          events={events}
        />

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[360px] rounded-xl" />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold">
                No events found
              </h3>
              <p className="mb-6 max-w-sm text-muted-foreground">
                We couldn&apos;t find any events matching your current filters.
                Try changing the author, tag, or date range.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
