import { CalendarDays, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";

const formatDate = (date: Date, formatStr: string) => {
  const options: Intl.DateTimeFormatOptions = {};

  if (formatStr.includes("MMM")) options.month = "short";
  if (formatStr.includes("MMMM")) options.month = "long";
  if (formatStr.includes("d")) options.day = "numeric";
  if (formatStr.includes("yyyy")) options.year = "numeric";

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

export type Blog = {
  id: string;
  slug?: string;
  title: string;
  excerpt?: string;
  coverUrl?: string;
  authorName?: string;
  authorSlug?: string;
  authorAvatar?: string;
  publishedAt?: string;
  language: string;
  tags?: string[];
};

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Link href={`/blogs/${blog.slug ?? blog.id}`}>
      <Card className="group flex h-full cursor-pointer flex-col overflow-hidden transition-all hover-elevate">
        <div className="relative">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            {blog.coverUrl ? (
              <Image
                src={blog.coverUrl}
                alt={blog.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                <FileText className="h-12 w-12 opacity-20" />
              </div>
            )}
          </AspectRatio>
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs font-normal rounded-sm">
              {blog.language}
            </Badge>
            {blog.publishedAt ? (
              <Badge
                variant="secondary"
                className="border-transparent bg-background/90 text-xs font-normal text-foreground"
              >
                {formatDate(new Date(blog.publishedAt), "MMM d yyyy")}
              </Badge>
            ) : null}
          </div>
        </div>

        <CardHeader className="space-y-3 p-4 pb-2">
          <h3 className="line-clamp-2 font-serif text-lg font-bold leading-tight transition-colors group-hover:text-primary">
            {blog.title}
          </h3>
          {blog.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {blog.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-sm px-1.5 py-0 text-[11px] font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-0">
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {blog.excerpt || "No excerpt available."}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-7 w-7 shrink-0">
              {blog.authorAvatar && (
                <AvatarImage src={blog.authorAvatar || undefined} />
              )}
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {blog.authorName ? getInitials(blog.authorName) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="line-clamp-1 font-medium text-foreground">
              {blog.authorName ?? "Author"}
            </span>
          </div>
          {blog.publishedAt && (
            <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatDate(new Date(blog.publishedAt), "MMM d")}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
