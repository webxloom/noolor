"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAuthorBooks } from "@/app/hooks/author/use-author-books";

type AuthorBooksContextValue = ReturnType<typeof useAuthorBooks>;

const AuthorBooksContext = createContext<AuthorBooksContextValue | null>(null);

export function AuthorBooksProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AuthorBooksContextValue;
}) {
  return (
    <AuthorBooksContext.Provider value={value}>
      {children}
    </AuthorBooksContext.Provider>
  );
}

export function useAuthorBooksContext() {
  const context = useContext(AuthorBooksContext);

  if (!context) {
    throw new Error(
      "useAuthorBooksContext must be used within an AuthorBooksProvider",
    );
  }

  return context;
}
