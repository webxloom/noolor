import { MapPin } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

type Author = {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  location?: string;
  bookCount: number;
  reviewCount: number;
  languages: string[];
};

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Link href={`/authors/${author.slug}`}>
      <Card className="h-full hover-elevate transition-all cursor-pointer group text-center p-6 flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-4 border-2 border-background ring-2 ring-primary/10 shadow-sm transition-transform duration-300 group-hover:scale-105">
          {author.avatarUrl && (
            <AvatarImage
              src={author.avatarUrl || undefined}
              alt={author.name}
              className="object-cover"
            />
          )}
          <AvatarFallback className="bg-primary/5 text-primary text-xl font-serif">
            {getInitials(author.name)}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-serif font-bold text-lg mb-1 group-hover:text-primary transition-colors">
          {author.name}
        </h3>

        {author.location && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center mb-3">
            <MapPin className="h-3 w-3" /> {author.location}
          </p>
        )}

        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex flex-col items-center">
            <span className="font-bold text-foreground">
              {author.bookCount}
            </span>
            <span className="text-xs uppercase tracking-wider opacity-70">
              Books
            </span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-foreground">
              {author.reviewCount}
            </span>
            <span className="text-xs uppercase tracking-wider opacity-70">
              Reviews
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-1 mt-auto">
          {author.languages.slice(0, 2).map((lang: any) => (
            <Badge
              key={lang}
              variant="secondary"
              className="text-xs font-normal rounded-sm"
            >
              {lang}
            </Badge>
          ))}
          {author.languages.length > 2 && (
            <Badge
              variant="secondary"
              className="text-xs font-normal rounded-sm"
            >
              +{author.languages.length - 2}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
