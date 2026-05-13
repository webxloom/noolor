import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { BookOpen, Clock, Hash, Star } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { getAuthorsQuery } from "@/lib/db/authors/authors-queries";
import { getBookBySlugQuery } from "@/lib/db/books/books-queries";

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

type DetailedBook = {
  id: string;
  slug: string;
  coverUrl?: string;
  title: string;
  authorName: string;
  authorSlug?: string;
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

  const { data: book, error } = await getBookBySlugQuery(supabase, slug);

  if (error || !book) {
    notFound();
  }

  const [authorsResult, reviewsResult] = await Promise.all([
    getAuthorsQuery(supabase),
    supabase
      .from("reviews")
      .select("id, user_id, created_at, rating, content")
      .eq("book_id", book.id)
      .order("created_at", { ascending: false })
      .returns<ReviewRecord[]>(),
  ]);

  const author = (authorsResult.data ?? []).find(
    (entry) => entry.id === book.author_id,
  );
  const reviewRows = reviewsResult.data ?? [];
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
    authorName: author?.name ?? "Unknown author",
    authorSlug: author?.slug ?? undefined,
    contentUrl: book.content_url ?? undefined,
    coverUrl: book.cover_url ?? undefined,
    description: book.description ?? "No synopsis has been added yet.",
    genre: book.genres?.[0] ?? "Uncategorized",
    id: book.id,
    isFree: book.is_free === true,
    language: book.language ?? "Unknown",
    pageCount: book.page_count ?? undefined,
    price: book.price ?? undefined,
    publishedYear: book.published_year ?? undefined,
    quotes: Array.isArray(book.quotes) ? book.quotes : [],
    rating,
    reviewCount: reviewRows.length,
    reviews: reviewRows.map((review) => ({
      content: review.content ?? "",
      createdAt: review.created_at ?? new Date().toISOString(),
      id: review.id,
      rating: review.rating,
      userName: profilesById.get(review.user_id)?.name?.trim() || "Reader",
    })),
    slug: book.slug,
    title: book.title,
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-16 flex flex-col gap-12 md:flex-row">
        <div className="w-full flex-shrink-0 md:w-1/3">
          <div className="sticky top-24 flex aspect-[2/3] items-center justify-center overflow-hidden rounded-xl border bg-muted shadow-lg">
            {detailedBook.coverUrl ? (
              <Image
                src={detailedBook.coverUrl}
                alt={detailedBook.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="h-24 w-24 text-muted-foreground opacity-20" />
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4 flex gap-2">
            <Badge
              variant="secondary"
              className="border-transparent bg-primary/10 text-primary hover:bg-primary/20"
            >
              {detailedBook.genre}
            </Badge>
            <Badge variant="outline">{detailedBook.language}</Badge>
          </div>

          <h1 className="mb-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {detailedBook.title}
          </h1>

          <p className="mb-6 flex items-center gap-2 text-xl text-muted-foreground">
            By{" "}
            {detailedBook.authorSlug ? (
              <Link
                href={`/authors/${detailedBook.authorSlug}`}
                className="font-medium text-primary hover:underline"
              >
                {detailedBook.authorName}
              </Link>
            ) : (
              <span className="font-medium text-foreground">
                {detailedBook.authorName}
              </span>
            )}
          </p>

          <div className="mb-8 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="text-base font-bold">
                {detailedBook.reviewCount > 0
                  ? detailedBook.rating.toFixed(1)
                  : "N/A"}
              </span>
              <span className="text-muted-foreground">
                ({detailedBook.reviewCount} review
                {detailedBook.reviewCount === 1 ? "" : "s"})
              </span>
            </div>

            {detailedBook.publishedYear ? (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{detailedBook.publishedYear}</span>
              </div>
            ) : null}

            {detailedBook.pageCount ? (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{detailedBook.pageCount} pages</span>
              </div>
            ) : null}

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Hash className="h-4 w-4" />
              <span>/{detailedBook.slug}</span>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between rounded-xl border bg-muted/30 p-6">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Access</p>
              <p className="font-mono text-2xl font-bold">
                {detailedBook.isFree
                  ? "Free"
                  : detailedBook.price
                    ? `INR ${detailedBook.price}`
                    : "Not for sale"}
              </p>
            </div>
            {detailedBook.contentUrl ? (
              <Button size="lg" className="px-8 font-semibold" asChild>
                <Link
                  href={detailedBook.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {detailedBook.isFree ? "Read Now" : "Open Book"}
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="px-8 font-semibold" disabled>
                {detailedBook.isFree ? "Read Now" : "Purchase"}
              </Button>
            )}
          </div>

          <div className="max-w-none">
            <h3 className="mb-4 font-serif text-2xl font-bold">Synopsis</h3>
            <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
              {detailedBook.description}
            </p>
          </div>
        </div>
      </div>

      {detailedBook.quotes.length > 0 ? (
        <>
          <Separator className="my-12" />
          <section className="space-y-6">
            <h2 className="font-serif text-3xl font-bold">Selected Quotes</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {detailedBook.quotes.map((quote, index) => (
                <blockquote
                  key={`${detailedBook.id}-quote-${index}`}
                  className="rounded-xl border bg-card px-6 py-5 text-base italic leading-7 text-muted-foreground"
                >
                  “{quote}”
                </blockquote>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <Separator className="my-12" />

      <div className="grid">
        <h2 className="mb-8 font-serif text-3xl font-bold">Reader Reviews</h2>
        {detailedBook.reviews.length > 0 ? (
          <div className="space-y-6">
            {detailedBook.reviews.map((review) => (
              <div key={review.id} className="rounded-xl border bg-card p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-serif font-bold text-primary">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
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
                  {review.content || "No written review was added."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/10 py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              No reviews yet. Be the first to share your thoughts!
            </p>
            <Button variant="outline" disabled>
              Write a Review
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
