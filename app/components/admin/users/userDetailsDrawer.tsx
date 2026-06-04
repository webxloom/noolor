"use client";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getReaderLibraryEntries } from "@/lib/db/readers/reader-library-queries";
import { getAuthorByUserIdQuery } from "@/lib/db/authors/authors-queries";
import { getPublicationByUserIdQuery } from "@/lib/db/publications/publications-queries";
import { getBooksByAuthorIdQuery } from "@/lib/db/books/books-queries";
import { getBlogsByUserIdQuery } from "@/lib/db/blogs/blogs-queries";
import { getEventsByProfileIdQuery } from "@/lib/db/events/events-queries";
import UserProfile from "./profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import ReaderLibrary from "../../readers/reader-library";
import AuthorDetail from "./author-details";
import { AuthorRecord } from "@/lib/types/authors";
import { AuthorBooksTab } from "../../authors/author-dashboard/books";
import { AuthorBlogsTab } from "../../authors/author-dashboard/blogs";
import { AuthorEventsTab } from "../../authors/author-dashboard/events";

type Props = {
  user: any;
  open: boolean;
  onClose: () => void;
};

export default function UserDetailsDrawer({ user, open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [readerLib, setReaderLib] = useState<any[]>([]);
  const [author, setAuthor] = useState<AuthorRecord | null>(null);
  const [publication, setPublication] = useState<any | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("profile");

  function handleTabChange(value: string) {
    setActiveTab(value);
  }

  useEffect(() => {
    if (!open || !user) return;

    let mounted = true;
    const userId = user.id;
    const role = user.role;

    async function fetchDetails() {
      setLoading(true);
      try {
        const supabase = createBrowserSupabaseClient();

        // Reader library
        const entries = await getReaderLibraryEntries(supabase, userId);
        setReaderLib(entries ?? []);

        if (!mounted) return;

        let ownerId: string | null = null;
        // Author details
        if (role === "writer") {
          const { data: a, error: authorErr } = await getAuthorByUserIdQuery(
            supabase,
            userId,
          );
          if (!mounted) return;
          if (authorErr) {
            console.error(authorErr);
          } else {
            setAuthor(a ?? null);
            ownerId = a?.id ?? null;
          }
        }

        // Publication details
        if (role === "publication") {
          const { data: p, error: pubErr } = await getPublicationByUserIdQuery(
            supabase,
            userId,
          );
          if (!mounted) return;
          if (pubErr) {
            console.error(pubErr);
          } else {
            setPublication(p ?? null);
            ownerId = p?.id ?? null;
          }
        }

        // Get books, blogs, and events for the user
        if (ownerId) {
          const { data: bData } = await getBooksByAuthorIdQuery(
            supabase,
            ownerId,
          );
          const { data: blogData } = await getBlogsByUserIdQuery(
            supabase,
            userId,
          );
          const { data: eventData } = await getEventsByProfileIdQuery(
            supabase,
            userId,
          );
          if (!mounted) return;
          setBooks(bData ?? []);
          setBlogs(blogData ?? []);
          setEvents(eventData ?? []);
        }
      } catch (e) {
        console.error("Error fetching user details", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDetails();

    return () => {
      mounted = false;
      setReaderLib([]);
      setAuthor(null);
      setPublication(null);
      setBooks([]);
      setBlogs([]);
      setEvents([]);
    };
  }, [open, user]);

  if (!open) return null;

  const tabs = useMemo(() => {
    const baseTabs = [{ label: "Profile", value: "profile" }];
    if (readerLib.length > 0) {
      baseTabs.push({ label: "Reader Library", value: "reader-library" });
    }
    if (author) {
      baseTabs.push({ label: "Author", value: "author" });
    }
    if (publication) {
      baseTabs.push({ label: "Publication", value: "publication" });
    }
    if (books.length > 0) {
      baseTabs.push({ label: "Books", value: "books" });
    }
    if (blogs.length > 0) {
      baseTabs.push({ label: "Blogs", value: "blogs" });
    }
    if (events.length > 0) {
      baseTabs.push({ label: "Events", value: "events" });
    }
    return baseTabs;
  }, [readerLib, author, publication, books, blogs, events]);

  return (
    <div className="h-full w-full overflow-auto">
      <div className="w-full p-4 border-b flex items-center justify-between bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold">User Details</h2>
        <button
          onClick={onClose}
          className="text-sm text-gray-600 dark:text-gray-300"
        >
          Close
        </button>
      </div>

      <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
        {loading ? (
          <div>Loading details...</div>
        ) : (
          <>
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="space-y-3 sm:space-y-4"
            >
              {/* Tabs */}
              <TabsList className="h-auto w-full justify-start gap-1 sm:gap-2 overflow-x-auto border border-border/70 bg-card p-1.5 sm:p-2 scrollbar-hide flex-nowrap">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="cursor-pointer hover:bg-primary/50 hover:text-primary text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tabs content */}
              <TabsContent value={activeTab} className="space-y-6">
                {activeTab === "profile" && <UserProfile user={user} />}

                {/* Reader library */}
                {activeTab === "reader-library" && (
                  <ReaderLibrary userId={user.id} role="admin" />
                )}

                {/* Author / Publication details */}
                {(activeTab === "author" || activeTab === "publication") && (
                  <AuthorDetail
                    author={activeTab === "author" ? author : publication}
                    isPublication={activeTab === "publication"}
                  />
                )}

                {/* Books */}
                {activeTab === "books" && (
                  <AuthorBooksTab
                    canEdit={true}
                    authorId={author?.id ?? publication?.id ?? ""}
                    isPublication={author?.id ? false : true}
                  />
                )}

                {/* Blogs */}
                {activeTab === "blogs" && (
                  <AuthorBlogsTab canEdit={true} authorId={user.id} />
                )}

                {/* Events */}
                {activeTab === "events" && (
                  <AuthorEventsTab canEdit={true} profileId={user.id} />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
