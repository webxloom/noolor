"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAuthorBlogs } from "@/app/hooks/use-author-blogs";

type AuthorBlogsContextValue = ReturnType<typeof useAuthorBlogs>;

const AuthorBlogsContext = createContext<AuthorBlogsContextValue | null>(null);

export function AuthorBlogsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AuthorBlogsContextValue;
}) {
  return (
    <AuthorBlogsContext.Provider value={value}>
      {children}
    </AuthorBlogsContext.Provider>
  );
}

export function useAuthorBlogsContext() {
  const context = useContext(AuthorBlogsContext);

  if (!context) {
    throw new Error(
      "useAuthorBlogsContext must be used within an AuthorBlogsProvider",
    );
  }

  return context;
}
