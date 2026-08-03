"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useBlogsList } from "../hooks/blogs/use-blogs-list";

type BlogsContextValue = ReturnType<typeof useBlogsList>;

const BlogsContext = createContext<BlogsContextValue | null>(null);

export function BlogsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: BlogsContextValue;
}) {
  return (
    <BlogsContext.Provider value={value}>{children}</BlogsContext.Provider>
  );
}

export function useBlogsContext() {
  const context = useContext(BlogsContext);

  if (!context) {
    throw new Error("useBlogsContext must be used within an BlogsProvider");
  }

  return context;
}
