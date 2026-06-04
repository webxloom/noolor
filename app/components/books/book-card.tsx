import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";

export type Book = {
  id: string;
  slug: string;
  coverUrl?: string;
  title: string;
  authorName?: string;
  authorSlug?: string;
  isFree: boolean;
  language: string;
  genre: string;
  rating?: number;
  reviewCount: number;
  price?: number;
};

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.slug}`}>
      <Card className="border-0 shadow-md hover-elevate transition-all cursor-pointer">
        <div className="mx-auto">
          <div className="relative h-64 overflow-hidden rounded-lg shadow-md">
            <Image
              src={
                book.coverUrl ? book.coverUrl : "/images/book-placeholder.png"
              }
              alt={book.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        <CardContent className="space-y-2 px-1 py-3 bg-muted/20 p-4 backdrop-blur-sm rounded-b-lg">
          <h3 className="line-clamp-2 text-sm font-semibold">{book.title}</h3>

          <p className="text-xs text-muted-foreground">{book.authorName}</p>

          <p className="text-xs text-muted-foreground">
            {book.language} • {book.genre}
          </p>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{book.rating?.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({book.reviewCount})
              </span>
            </div>

            <span className="font-semibold text-primary">
              {book.isFree ? "Free" : `₹${book.price}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
