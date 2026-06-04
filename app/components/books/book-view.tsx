"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Hooks / Queries
import { useReaderLibrary } from "@/app/hooks/reader/use-reader-library";
import { getBookLikesAndReviews } from "@/lib/db/readers/reader-library-queries";

// Components
import BookDetail from "./book-detail";
import { Separator } from "../ui/separator";
import { DetailedBook } from "@/app/(pages)/books/[slug]/page";
import BookReviews from "./book-reviews";
import BookBrief from "./book-brief";
import BookReadingPanel from "../shared/book-reading-panel";
import BookActions from "./book-actions";

export default function BookView({ bookDetail }: { bookDetail: DetailedBook }) {
  const [openPanel, setOpenPanel] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [entry, setEntry] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number | null>(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const supabase = createBrowserSupabaseClient();
  const { getEntry } = useReaderLibrary();

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsAuthenticated(!!session);
      setUserId(session?.user?.id ?? null);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Get book entry for the user and book
  useEffect(() => {
    if (!userId || !bookDetail.id) {
      setCurrentPage(null);
      setTotalPages(null);
      setEntry(null);
      return;
    }

    (async () => {
      const res = await getEntry(userId, bookDetail.id);
      setEntry(res.data ?? null);
      const shelf = res.data?.shelf ?? null;
      if (shelf && typeof shelf === "string") {
        const m = shelf.match(/^page:(\d+)$/);
        if (m) {
          const pg = Number(m[1]);
          if (!Number.isNaN(pg) && pg > 0) setCurrentPage(pg);
        }
      }
    })();
  }, [userId, bookDetail.id]);

  // Get book likes and reviews for the book by id
  useEffect(() => {
    async function loadBookLikesAndReviews() {
      // Call the function to get likes and reviews for the book
      const likesAndReviews = await getBookLikesAndReviews(
        supabase,
        bookDetail.id,
      );
      if (likesAndReviews.error) {
        console.error(
          "Error fetching likes and reviews:",
          likesAndReviews.error,
        );
        return;
      }

      setLikesCount(likesAndReviews.likesCount ?? 0);
      setReviews(likesAndReviews.reviews ?? []);
    }
    void loadBookLikesAndReviews();
  }, [bookDetail.id]);

  const getBookmarkedPage = (shelf?: string | null) => {
    if (!shelf) return null;
    if (typeof shelf === "string") {
      const m = shelf.match(/^page:(\d+)$/);
      if (m) return Number(m[1]);
    }
    const page = Number(shelf);
    return isNaN(page) ? null : page;
  };

  const handlePageChange = (page: number, numPages: number) => {
    setCurrentPage(page);
    setTotalPages(numPages);
  };

  if (openPanel) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col gap-6">
        {/* Book actions */}
        <BookActions
          setOpenPanel={setOpenPanel}
          userId={userId}
          bookId={bookDetail.id}
          currentPage={currentPage ?? null}
          totalPages={totalPages ?? null}
          entry={entry}
          setEntry={setEntry}
        />

        <div className="flex flex-row gap-6">
          {/* Book summary */}
          <BookBrief bookDetail={bookDetail} />

          {/* Panel */}
          <BookReadingPanel
            contentUrl={bookDetail.contentUrl}
            previewPages={isAuthenticated ? "all" : 10}
            onPageChange={handlePageChange}
            bookmarkedPage={getBookmarkedPage(entry?.shelf)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <BookDetail
        bookDetail={bookDetail}
        setOpenPanel={setOpenPanel}
        bookProgress={entry?.progress ?? null}
        likesCount={likesCount}
        reviewsCount={reviews.length}
      />

      <Separator className="my-12" />

      <BookReviews
        bookDetail={bookDetail}
        userId={userId}
        entry={entry}
        setEntry={setEntry}
        reviews={reviews}
        setReviews={setReviews}
      />
    </div>
  );
}
