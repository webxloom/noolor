"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAuthorEvents } from "@/app/hooks/author/use-author-events";

type AuthorEventsContextValue = ReturnType<typeof useAuthorEvents>;

const AuthorEventsContext = createContext<AuthorEventsContextValue | null>(
  null,
);

export function AuthorEventsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AuthorEventsContextValue;
}) {
  return (
    <AuthorEventsContext.Provider value={value}>
      {children}
    </AuthorEventsContext.Provider>
  );
}

export function useAuthorEventsContext() {
  const context = useContext(AuthorEventsContext);

  if (!context) {
    throw new Error(
      "useAuthorEventsContext must be used within an AuthorEventsProvider",
    );
  }

  return context;
}
