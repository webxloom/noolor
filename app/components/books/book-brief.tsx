import { BookOpen } from "lucide-react";
import Image from "next/image";

// Components
import { Badge } from "../ui/badge";
import { DetailedBook } from "@/app/(pages)/books/[slug]/page";

export default function BookBrief({
  bookDetail,
}: {
  bookDetail: DetailedBook;
}) {
  return (
    <>
      <div className="mb-16 flex flex-col gap-6">
        <div className="w-full flex-shrink-0">
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
            <span className="font-medium text-foreground">
              {bookDetail.authorName}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
