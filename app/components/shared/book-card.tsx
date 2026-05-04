import Image from "next/image";
import { BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { AspectRatio } from "../ui/aspect-ratio";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";

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
      <Card className="h-full overflow-hidden hover-elevate transition-all cursor-pointer group">
        <div className="relative">
          <AspectRatio ratio={2 / 3} className="bg-muted">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-secondary text-secondary-foreground">
                <BookOpen className="h-12 w-12 opacity-20" />
              </div>
            )}
          </AspectRatio>
          {book.isFree && (
            <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white border-none">
              Free
            </Badge>
          )}
        </div>
        <CardHeader className="p-4 pb-2 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
          </div>
          {book.authorName && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {book.authorName}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge
              variant="outline"
              className="text-xs font-normal rounded-sm px-1.5 py-0"
            >
              {book.language}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-normal rounded-sm px-1.5 py-0"
            >
              {book.genre}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground border-t bg-muted/20 py-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>{book.rating?.toFixed(1) || "N/A"}</span>
            <span className="text-xs opacity-70">({book.reviewCount})</span>
          </div>
          <div className="font-medium text-foreground">
            {book.isFree ? "Free" : book.price ? `$${book.price}` : ""}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
