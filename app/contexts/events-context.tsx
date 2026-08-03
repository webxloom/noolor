"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useEventsList } from "../hooks/events/use-events-list";

type EventsContextValue = ReturnType<typeof useEventsList>;

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: EventsContextValue;
}) {
  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useEventsContext() {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error("useEventsContext must be used within an EventsProvider");
  }

  return context;
}
