"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useReaderProfile } from "@/app/hooks/reader/use-reader-profile";

type ReaderProfileContextValue = ReturnType<typeof useReaderProfile>;

const ReaderProfileContext = createContext<ReaderProfileContextValue | null>(
  null,
);

export function ReaderProfileProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ReaderProfileContextValue;
}) {
  return (
    <ReaderProfileContext.Provider value={value}>
      {children}
    </ReaderProfileContext.Provider>
  );
}

export function useReaderProfileContext() {
  const context = useContext(ReaderProfileContext);

  if (!context) {
    throw new Error(
      "useReaderProfileContext must be used within a ReaderProfileProvider",
    );
  }

  return context;
}
