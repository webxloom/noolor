import { BookOpen, Clock, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Components
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { DetailedBook } from "@/app/(pages)/books/[slug]/page";

export default function BookDetail({
  bookDetail,
  setOpenPanel,
  bookProgress,
  likesCount,
  reviewsCount,
}: {
  bookDetail: DetailedBook;
  setOpenPanel: (open: boolean) => void;
  bookProgress?: number | null;
  likesCount?: number | null;
  reviewsCount?: number | null;
}) {
  return (
    <>
      <div className="mb-16 flex flex-col gap-12 md:flex-row">
        <div className="w-full flex-shrink-0 md:w-1/3">
          <div className="sticky top-24 flex aspect-[2/3] items-center justify-center overflow-hidden rounded-xl border bg-muted shadow-lg">
            {bookDetail.coverUrl ? (
              <Image
                src={bookDetail.coverUrl}
                alt={bookDetail.title}
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
              {bookDetail.genre}
            </Badge>
            <Badge variant="outline">{bookDetail.language}</Badge>
          </div>

          <h1 className="mb-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {bookDetail.title}
          </h1>

          <p className="mb-6 flex items-center gap-2 text-xl text-muted-foreground">
            By{" "}
            <Link
              href={`/authors/${bookDetail.authorSlug}`}
              className="flex items-center gap-2 font-medium text-foreground hover:underline"
            >
              <span className="font-medium text-foreground">
                {bookDetail.authorName}
              </span>
            </Link>
          </p>

          <div className="mb-8 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <ThumbsUp
                className={`h-4 w-4 ${likesCount ? "fill-green-500 text-green-500" : ""}`}
              />
              <span className="text-base font-bold">
                {likesCount != null ? likesCount : 0}
              </span>
              <span className="text-muted-foreground">
                ({reviewsCount} review
                {reviewsCount === 1 ? "" : "s"})
              </span>
            </div>

            {bookDetail.publishedYear ? (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{bookDetail.publishedYear}</span>
              </div>
            ) : null}

            {bookDetail.pageCount ? (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{bookDetail.pageCount} pages</span>
              </div>
            ) : null}
          </div>

          <div className="mb-8 flex items-center justify-between rounded-xl border bg-muted/30 p-6">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Access</p>
              <p className="font-mono text-2xl font-bold">
                {bookDetail.isFree
                  ? "Free"
                  : bookDetail.price
                    ? `INR ${bookDetail.price}`
                    : "Not for sale"}
              </p>
            </div>
            {bookDetail.contentUrl ? (
              <Button
                size="lg"
                className="px-8 font-semibold cursor-pointer"
                onClick={() => setOpenPanel(true)}
              >
                {bookProgress === 100
                  ? "Read Again"
                  : bookProgress != null && bookProgress > 0
                    ? "Continue Reading"
                    : "Read Now"}
              </Button>
            ) : (
              <Button size="lg" className="px-8 font-semibold" disabled>
                {bookDetail.isFree ? "Read Now" : "Purchase"}
              </Button>
            )}
          </div>

          <div className="max-w-none">
            <h3 className="mb-4 font-serif text-2xl font-bold">Synopsis</h3>
            <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
              {bookDetail.description}
            </p>
          </div>
        </div>
      </div>

      {bookDetail.quotes.length > 0 ? (
        <>
          <Separator className="my-12" />
          <section className="space-y-6">
            <h2 className="font-serif text-3xl font-bold">Selected Quotes</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {bookDetail.quotes.map((quote, index) => (
                <blockquote
                  key={`quote-${index}`}
                  className="rounded-xl border bg-card px-6 py-5 text-base italic leading-7 text-muted-foreground"
                >
                  “{quote}”
                </blockquote>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
