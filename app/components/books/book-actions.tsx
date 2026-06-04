import { useEffect, useState } from "react";
import { ThumbsUp } from "lucide-react";

// Hooks
import { useReaderLibrary } from "@/app/hooks/reader/use-reader-library";

// Components
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import Rating from "../shared/rating";

export default function BookActions({
  setOpenPanel,
  userId,
  bookId,
  currentPage,
  totalPages,
  entry,
  setEntry,
}: {
  setOpenPanel: (open: boolean) => void;
  userId: string | null;
  bookId: string;
  currentPage?: number | null; // optional current reading page
  totalPages?: number | null; // optional total pages in the book
  entry?: any | null; // optional existing library entry for the book
  setEntry: (entry: any | null) => void; // function to update the entry state
}) {
  const { saveEntry } = useReaderLibrary();
  const [saving, setSaving] = useState({ readLater: false, bookmark: false });
  const [rating, setRating] = useState<number | undefined>(
    entry?.rating ?? undefined,
  );

  useEffect(() => {
    setRating(entry?.rating ?? undefined);
  }, [entry]);

  const isShelfBookmarked = (shelf?: string | null) => {
    return !!shelf && Number(shelf);
  };

  const handleReadLater = async () => {
    if (!userId) return;
    try {
      setSaving((prev) => ({ ...prev, readLater: true }));
      // if current shelf is a bookmarked page then mark as completed and set completed_at
      if (entry && isShelfBookmarked(entry.shelf)) {
        const r = await saveEntry(userId, bookId, {
          shelf: "completed_books",
          completed_at: new Date().toISOString(),
          progress: 100,
        });
        setEntry(r.data ?? entry);
      } else {
        const r = await saveEntry(userId, bookId, { shelf: "want_to_read" });
        setEntry(r.data ?? entry);
      }
    } finally {
      setSaving((prev) => ({ ...prev, readLater: false }));
    }
  };

  const handleBookmark = async () => {
    if (!userId || !currentPage) return;
    try {
      setSaving((prev) => ({ ...prev, bookmark: true }));
      //   Calculate progress percentage if totalPages is available
      let progress: number | null = null;
      if (totalPages && totalPages > 0) {
        progress = Math.round((currentPage / totalPages) * 100);
      }
      const r = await saveEntry(userId, bookId, {
        shelf: currentPage.toString(), // store the current page as the shelf
        progress,
      });
      setEntry(r.data ?? entry);
    } finally {
      setSaving((prev) => ({ ...prev, bookmark: false }));
    }
  };

  const handleLike = async () => {
    if (!userId) return;
    try {
      // toggle the is_favorite field
      const newFavoriteStatus = !entry?.is_favorite;
      const r = await saveEntry(userId, bookId, {
        is_favorite: newFavoriteStatus,
      });
      setEntry(r.data ?? entry);
    } finally {
      setSaving((prev) => ({ ...prev, like: false }));
    }
  };

  const handleRatingChange = async (newRating: number | null) => {
    if (!userId) return;
    try {
      const r = await saveEntry(userId, bookId, { rating: newRating });
      setEntry(r.data ?? entry);
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  return (
    <div className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-muted p-4 shadow">
      {userId ? (
        <div className="flex flex-row gap-4">
          {/* Read later / Mark as completed */}
          <Button
            size="sm"
            variant="default"
            className="px-4 font-semibold cursor-pointer"
            onClick={handleReadLater}
            disabled={
              saving.readLater ||
              entry?.shelf === "want_to_read" ||
              entry?.shelf === "completed_books"
            }
          >
            {saving.readLater ? <Spinner className="size-4" /> : null}
            <span>
              {entry && isShelfBookmarked(entry.shelf)
                ? "Mark as completed"
                : "Read Later"}
            </span>
          </Button>

          {/* Bookmark page */}
          <Button
            size="sm"
            variant="destructive"
            className="px-4 font-semibold cursor-pointer"
            onClick={handleBookmark}
            disabled={saving.bookmark || !currentPage}
          >
            {saving.bookmark ? <Spinner className="size-4" /> : null}
            <span>Bookmark Page</span>
          </Button>

          {/* Like this book */}
          <Button
            size="sm"
            variant="outline"
            className={`px-4 font-semibold cursor-pointer ${
              entry?.is_favorite ? "bg-green-100" : ""
            }`}
            onClick={handleLike}
          >
            <ThumbsUp
              className={`h-4 w-4 ${
                entry.is_favorite ? "text-green-600" : "text-muted-foreground"
              }`}
            />
          </Button>

          {/* Rating */}
          <Rating value={rating} onChange={handleRatingChange} />
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Please log in to access more actions.
        </div>
      )}

      {/* Back to book */}
      <Button
        size="sm"
        variant="link"
        className="px-4 font-semibold cursor-pointer"
        onClick={() => setOpenPanel(false)}
      >
        Close Reading Panel
      </Button>
    </div>
  );
}
