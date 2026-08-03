"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAuthorProfile } from "../hooks/author/use-author-profile";

type AuthorContextValue = ReturnType<typeof useAuthorProfile>;

const AuthorContext = createContext<AuthorContextValue | null>(null);

export function AuthorContextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AuthorContextValue;
}) {
  return (
    <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>
  );
}

export function useAuthorContext() {
  const context = useContext(AuthorContext);

  if (!context) {
    throw new Error(
      "useAuthorContext must be used within an AuthorProfileProvider",
    );
  }

  return context;
}
