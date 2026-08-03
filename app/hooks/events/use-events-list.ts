"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  EventRecord,
  getAllEventsQuery,
  getEventsByHostIdQuery,
} from "@/lib/db/events/events-queries";

function getEventStatus(event: EventRecord) {
  return (event.status ?? "draft") as string;
}

function matchesEventSearch(event: EventRecord, normalized: string) {
  const hay = [event.title, event.description, event.city, event.venue_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return hay.includes(normalized);
}

export function useEventsList(hostId: string | null, role: string = "all") {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    debouncedSearch: "",
    status: "all",
  });
  const { search, debouncedSearch, status } = filters;

  const [activeTab, setActiveTab] = useState("catalog");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, debouncedSearch: f.search }));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      setIsLoading(true);
      setLoadError(null);

      const res =
        role === "all"
          ? await getAllEventsQuery(supabase)
          : await getEventsByHostIdQuery(supabase, hostId ?? "");

      if (!isMounted) return;

      if (res.error) {
        setLoadError(res.error.message);
        setEvents([]);
      } else {
        const data = res.data;
        setEvents(Array.isArray(data) ? data : data ? [data] : []);
      }

      setIsLoading(false);
    }

    void loadEvents();
    return () => {
      isMounted = false;
    };
  }, [supabase, hostId]);

  function resetEditor() {
    setEditingEventId(null);
  }

  function startCreate() {
    resetEditor();
    setActiveTab("editor");
  }

  function startEdit(event: EventRecord) {
    setEditingEventId(event.id);
    setActiveTab("editor");
  }

  const filteredEvents = useMemo(() => {
    const normalized = debouncedSearch.trim().toLowerCase();
    return events.filter((e) => {
      const statusMatch = status === "all" || getEventStatus(e) === status;
      const searchMatch =
        normalized.length === 0 || matchesEventSearch(e, normalized);
      return statusMatch && searchMatch;
    });
  }, [events, debouncedSearch, status]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, debouncedSearch: prev.search }));
  }

  function handleClearFilters() {
    setFilters({ search: "", debouncedSearch: "", status: "all" });
  }

  const activeFilterCount = [
    debouncedSearch.trim().length > 0,
    status !== "all",
  ].filter(Boolean).length;

  return {
    hostId,
    events,
    setEvents,
    activeTab,
    editingEventId,
    isLoading,
    loadError,
    filters,
    setFilters,
    setActiveTab,
    startCreate,
    startEdit,
    resetEditor,
    filteredEvents,
    handleSearchSubmit,
    handleClearFilters,
    activeFilterCount,
  };
}
