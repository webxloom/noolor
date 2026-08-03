"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useBooksList } from "@/app/hooks/books/use-books-list";

type BooksContextValue = ReturnType<typeof useBooksList>;

const BooksContext = createContext<BooksContextValue | null>(null);

export function BooksProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: BooksContextValue;
}) {
  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
}

export function useBooksContext() {
  const context = useContext(BooksContext);

  if (!context) {
    throw new Error("useBooksContext must be used within an BooksProvider");
  }

  return context;
}
