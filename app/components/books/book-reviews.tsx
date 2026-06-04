import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Star } from "lucide-react";

// Components
import { DetailedBook } from "@/app/(pages)/books/[slug]/page";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { useReaderLibrary } from "@/app/hooks/reader/use-reader-library";

export default function BookReviews({
  bookDetail,
  userId,
  entry,
  setEntry,
  reviews,
  setReviews,
}: {
  bookDetail: DetailedBook;
  userId: string | null;
  entry?: any | null;
  setEntry: Dispatch<SetStateAction<any | null>>;
  reviews: any[];
  setReviews: Dispatch<SetStateAction<any[]>>;
}) {
  const { saveEntry } = useReaderLibrary();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState<number | null>(null);

  // Initialize modal fields when opened
  useEffect(() => {
    if (!showReviewModal) return;
    // prefer entry if available, otherwise find the user's review in reviews
    const existing = entry ?? reviews.find((r) => r.userId === userId) ?? null;
    setReviewContent(existing?.review ?? "");
    setReviewRating(existing?.rating ?? null);
  }, [showReviewModal, entry, reviews, userId]);

  const handleReview = async () => {
    if (!userId) return;
    try {
      const r = await saveEntry(userId, bookDetail.id, {
        rating: reviewRating,
        review: reviewContent,
      });

      // update local entry state if available
      if (r.data) setEntry(r.data);

      setReviews((prevReviews: any[]) => {
        const existingReviewIndex = prevReviews.findIndex(
          (review) => review.user_id === userId,
        );
        const newReviewObj = {
          userId,
          userName: "You",
          rating: reviewRating,
          review: reviewContent,
          created_at: new Date().toISOString(),
        };

        if (existingReviewIndex !== -1) {
          const updated = [...prevReviews];
          updated[existingReviewIndex] = {
            ...updated[existingReviewIndex],
            rating: reviewRating,
            review: reviewContent,
            created_at: newReviewObj.created_at,
          };
          return updated;
        }

        return [...prevReviews, newReviewObj];
      });

      setShowReviewModal(false);
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  return (
    <div className="grid">
      <h2 className="mb-8 font-serif text-3xl font-bold">Reader Reviews</h2>
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.user_id} className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-serif font-bold text-primary">
                    {review.user_id === userId
                      ? "You"
                      : review?.profiles.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{review?.profiles.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${index < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground">
                {review.review || "No written review was added."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/10 py-12 text-center">
          <p className="mb-4 text-muted-foreground">
            No reviews yet. Be the first to share your thoughts!
          </p>
          <Button
            variant="outline"
            disabled={!userId}
            onClick={() => setShowReviewModal(true)}
          >
            Write a Review
          </Button>
        </div>
      )}

      {/* Review modal */}
      {showReviewModal && (
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 cursor-pointer ${i < (reviewRating ?? 0) ? "fill-primary text-primary" : "text-muted"}`}
                    onClick={() => setReviewRating(i + 1)}
                  />
                ))}
              </div>

              <Textarea
                placeholder="Write your review here"
                className="mt-2"
                rows={6}
                value={reviewContent}
                onChange={(e) =>
                  setReviewContent((e.target as HTMLTextAreaElement).value)
                }
              />

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleReview}>Submit Review</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
