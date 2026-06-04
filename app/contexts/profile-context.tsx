"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAuthorProfile } from "../hooks/author/use-author-profile";

type AuthorProfileContextValue = ReturnType<typeof useAuthorProfile>;

const AuthorProfileContext = createContext<AuthorProfileContextValue | null>(
  null,
);

export function AuthorProfileProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AuthorProfileContextValue;
}) {
  return (
    <AuthorProfileContext.Provider value={value}>
      {children}
    </AuthorProfileContext.Provider>
  );
}

export function useAuthorProfileContext() {
  const context = useContext(AuthorProfileContext);

  if (!context) {
    throw new Error(
      "useAuthorProfileContext must be used within an AuthorProfileProvider",
    );
  }

  return context;
}
