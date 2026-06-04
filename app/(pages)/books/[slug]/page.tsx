import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Queries
import { getBookBySlugQuery } from "@/lib/db/books/books-queries";

// Components
import BookView from "@/app/components/books/book-view";

type ReviewRecord = {
  id: string;
  created_at?: string | null;
  content?: string | null;
  rating: number;
  user_id: string;
};

type ProfileRecord = {
  id: string;
  name?: string | null;
};

export type DetailedBook = {
  id: string;
  coverUrl?: string;
  title: string;
  authorName: string;
  authorSlug: string;
  isFree: boolean;
  language: string;
  genre: string;
  rating: number;
  reviewCount: number;
  price?: number;
  publishedYear?: number;
  pageCount?: number;
  description: string;
  contentUrl?: string;
  quotes: string[];
  reviews: Array<{
    id: string;
    userName: string;
    createdAt: string;
    rating: number;
    content: string;
  }>;
};

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.",
    );
  }

  return createClient(supabaseUrl, publishableKey);
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();

  const { data: bookDetail, error } = await getBookBySlugQuery(supabase, slug);

  if (error || !bookDetail) {
    notFound();
  }

  const { book, author } = bookDetail;

  const { data: reviewsResult, error: reviewError } = await supabase
    .from("reviews")
    .select("id, user_id, created_at, rating, content")
    .eq("book_id", book?.id)
    .order("created_at", { ascending: false })
    .returns<ReviewRecord[]>();

  if (reviewError) {
    console.error("Error fetching reviews:", reviewError);
    notFound();
  }

  const reviewRows = reviewsResult ?? [];
  const profileIds = Array.from(
    new Set(reviewRows.map((review) => review.user_id)),
  );

  const profilesResult = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, name")
        .in("id", profileIds)
        .returns<ProfileRecord[]>()
    : { data: [] as ProfileRecord[] };

  const profilesById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
  );

  const rating =
    reviewRows.length > 0
      ? reviewRows.reduce((sum, review) => sum + review.rating, 0) /
        reviewRows.length
      : 0;

  const detailedBook: DetailedBook = {
    id: book?.id ?? "",
    authorName: author?.profile.name ?? "Unknown author",
    authorSlug: author?.slug ?? "",
    contentUrl: book?.content_url ?? undefined,
    coverUrl: book?.cover_url ?? undefined,
    description: book?.description ?? "No synopsis has been added yet.",
    genre: book?.genres?.[0] ?? "Uncategorized",
    isFree: book?.is_free === true,
    language: book?.language ?? "Unknown",
    pageCount: book?.page_count ?? undefined,
    price: book?.price ?? undefined,
    publishedYear: book?.published_year ?? undefined,
    quotes: Array.isArray(book?.quotes) ? book.quotes : [],
    rating,
    reviewCount: reviewRows.length,
    reviews: reviewRows.map((review) => ({
      content: review.content ?? "",
      createdAt: review.created_at ?? new Date().toISOString(),
      id: review.id,
      rating: review.rating,
      userName: profilesById.get(review.user_id)?.name?.trim() || "Reader",
    })),
    title: book?.title ?? "Untitled",
  };

  return <BookView bookDetail={detailedBook} />;
}
