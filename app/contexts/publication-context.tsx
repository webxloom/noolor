"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePublicationProfile } from "../hooks/use-publication-profile";

type PublicationContextValue = ReturnType<typeof usePublicationProfile>;

const PublicationContext = createContext<PublicationContextValue | null>(null);

export function PublicationContextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: PublicationContextValue;
}) {
  return (
    <PublicationContext.Provider value={value}>
      {children}
    </PublicationContext.Provider>
  );
}

export function usePublicationContext() {
  const context = useContext(PublicationContext);

  if (!context) {
    throw new Error(
      "usePublicationContext must be used within an PublicationProfileProvider",
    );
  }

  return context;
}
