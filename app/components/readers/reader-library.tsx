"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getReaderLibraryEntries } from "@/lib/db/readers/reader-library-queries";

type Book = {
  id: string;
  title: string;
  slug?: string;
  cover_url?: string | null;
  author_name?: string | null;
};

type LibraryEntry = {
  id: string;
  shelf: string;
  progress?: number | null;
  rating?: number | null;
  is_favorite?: boolean | null;
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  books?: Book | null;
};

export default function ReaderLibrary({
  userId,
  role = "default",
}: {
  userId: string;
  role?: string;
}) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      // Get the library entries for the user, including book details
      const response = await getReaderLibraryEntries(supabase, userId);
      if (!mounted) return;
      setEntries(response);
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  if (loading) return <div className="p-6">Loading library…</div>;

  if (entries.length === 0)
    return (
      <div className="p-6">
        Your library is empty. Add books to get started.
      </div>
    );

  return (
    <div className="p-6">
      <div
        className={`grid ${role === "admin" ? "grid-cols-2" : "grid-cols-3"}  gap-4`}
      >
        {entries.map((entry) => {
          const book = entry.books as Book | undefined;
          return (
            <div
              key={entry.id}
              className="flex gap-4 items-start rounded-md border p-4 bg-background"
            >
              <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded">
                {book?.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted/30 flex items-center justify-center text-sm">
                    No cover
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div>
                    <h4 className="font-medium">{book?.title ?? "Untitled"}</h4>
                    {book?.author_name && (
                      <p className="text-sm text-muted-foreground">
                        {book.author_name}
                      </p>
                    )}
                    <Link
                      href={
                        role === "admin" ? "" : `/books/${book?.slug ?? ""}`
                      }
                      className={`text-sm text-primary ${role === "admin" ? "cursor-not-allowed" : "hover:underline"}`}
                    >
                      {entry.shelf === "want_to_read"
                        ? "Start reading"
                        : entry.shelf === "completed_books"
                          ? "Completed"
                          : "Continue reading"}
                    </Link>
                  </div>
                </div>

                <div className="mt-3 flex flex-col items-start gap-4">
                  <div className="h-2 w-full rounded-full bg-muted/20">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${entry.progress ?? 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Progress: {entry.progress ?? 0}%
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Added:{" "}
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
