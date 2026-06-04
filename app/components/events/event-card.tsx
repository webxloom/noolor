import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";

const formatDate = (date: Date, formatStr: string) => {
  const options: Intl.DateTimeFormatOptions = {};

  if (formatStr.includes("MMM")) options.month = "short";
  if (formatStr.includes("MMMM")) options.month = "long";
  if (formatStr.includes("d")) options.day = "numeric";
  if (formatStr.includes("yyyy")) options.year = "numeric";

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

export type Event = {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  coverImage?: string;
  eventType: string;
  startAt: string;
  endAt?: string;
  eventMode: string;
  venueName?: string;
  venueAddress?: string;
  city?: string;
  meetingUrl?: string;
  status: string;
  createdAt: string;
  authorName?: string;
  authorSlug?: string;
  authorAvatar?: string;
};

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Link href={`/events/${event.slug}`} className="h-full">
      <Card className="overflow-hidden transition-all hover-elevate group h-full flex flex-col">
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={event.coverImage ?? "/images/default-event-cover.jpg"}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </AspectRatio>
        </div>

        <CardContent className="space-y-3 p-4 relative">
          <Badge className="absolute right-2 bottom-2">{event.eventType}</Badge>
          <h3 className="line-clamp-2 font-semibold">{event.title}</h3>

          <div className="space-y-1 text-sm text-muted-foreground">
            <div>📅 {formatDate(new Date(event.createdAt), "MMM d")}</div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-7 w-7 shrink-0">
              {event.authorAvatar && (
                <AvatarImage src={event.authorAvatar || undefined} />
              )}
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {event.authorName ? getInitials(event.authorName) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="line-clamp-1 font-medium text-foreground">
              {event.authorName ?? "Author"}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
