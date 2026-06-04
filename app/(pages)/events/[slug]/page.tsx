import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Link2,
} from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { getEventBySlugQuery } from "@/lib/db/events/events-queries";
import Link from "next/link";

type DetailedEvent = {
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
  visibility?: string;
  interestedCount?: number;
  goingCount?: number;
  createdAt?: string;
  authorName?: string;
  authorSlug?: string;
  role: string; // "writer" | "publication" | "reader"
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

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();

  const { data: eventDetail, error } = await getEventBySlugQuery(
    supabase,
    slug,
  );

  if (error || !eventDetail) {
    notFound();
  }

  const { event, authorSlug } = eventDetail;

  const detailedEvent: DetailedEvent = {
    title: event?.title ?? "Untitled event",
    description: event?.description ?? undefined,
    coverImage: event?.cover_image ?? undefined,
    eventType: event?.event_type ?? "Unknown",
    startAt: event?.start_at ?? new Date().toISOString(),
    endAt: event?.end_at ?? undefined,
    eventMode: event?.event_mode ?? "Unknown",
    venueName: event?.venue_name ?? undefined,
    venueAddress: event?.venue_address ?? undefined,
    city: event?.city ?? undefined,
    meetingUrl: event?.meeting_url ?? undefined,
    status: event?.status ?? "upcoming",
    visibility: event?.visibility ?? undefined,
    interestedCount: event?.interested_count ?? 0,
    goingCount: event?.going_count ?? 0,
    createdAt: event?.created_at ?? undefined,
    authorName: event?.profile?.name ?? undefined,
    authorSlug: authorSlug ?? undefined,
    role:
      event?.profile?.role === "writer"
        ? "writer"
        : event?.profile?.role === "publication"
          ? "publication"
          : "reader",
  };

  const eventStartAt = new Date(detailedEvent.startAt);
  const eventEndAt = detailedEvent.endAt ? new Date(detailedEvent.endAt) : null;

  const formattedDate = `${eventStartAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  const formattedTime = `${eventStartAt.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  })}${
    eventEndAt
      ? ` - ${eventEndAt.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        })}`
      : ""
  }`;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <article className="mb-16 flex flex-col gap-12 md:flex-row">
        <div className="w-full flex-shrink-0 md:w-1/3">
          <div className="sticky top-24 overflow-hidden rounded-xl border bg-muted shadow-lg">
            <div className="relative aspect-[2/3]">
              {detailedEvent.coverImage ? (
                <Image
                  src={detailedEvent.coverImage}
                  alt={detailedEvent.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                  <BookOpen className="h-24 w-24 opacity-20" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="border-transparent bg-primary/10 text-primary"
            >
              {detailedEvent.eventType}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {detailedEvent.eventMode}
            </Badge>
            {detailedEvent.status && (
              <Badge
                variant={
                  detailedEvent.status === "upcoming"
                    ? "secondary"
                    : detailedEvent.status === "cancelled"
                      ? "destructive"
                      : "outline"
                }
                className="capitalize"
              >
                {detailedEvent.status}
              </Badge>
            )}
          </div>

          <h1 className="mb-4 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {detailedEvent.title}
          </h1>

          {detailedEvent.authorName ? (
            <p className="mb-6 flex items-center gap-2 text-xl text-muted-foreground">
              Hosted by{" "}
              <Link
                href={
                  detailedEvent.role === "writer"
                    ? `/authors/${detailedEvent.authorSlug}`
                    : `/publications/${detailedEvent.authorSlug}`
                }
                className="flex items-center gap-2 font-medium text-foreground hover:underline"
              >
                <span className="font-medium text-foreground">
                  {detailedEvent.authorName}
                </span>
              </Link>
            </p>
          ) : null}

          <div className="mb-8 grid gap-4 rounded-3xl border border-border bg-muted/70 p-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <div>
                  <p className="text-foreground">{formattedDate}</p>
                  <p>{formattedTime}</p>
                </div>
              </div>

              {(detailedEvent.venueName ||
                detailedEvent.venueAddress ||
                detailedEvent.city) && (
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <div>
                    {detailedEvent.venueName ? (
                      <p className="text-foreground">
                        {detailedEvent.venueName}
                      </p>
                    ) : null}
                    {detailedEvent.venueAddress ? (
                      <p>{detailedEvent.venueAddress}</p>
                    ) : null}
                    {detailedEvent.city ? <p>{detailedEvent.city}</p> : null}
                  </div>
                </div>
              )}

              {detailedEvent.meetingUrl ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  <a
                    href={detailedEvent.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    Join event link
                  </a>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Attendees</p>
                  <p className="text-3xl font-semibold text-foreground">
                    {detailedEvent.goingCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interested</p>
                  <p className="text-3xl font-semibold text-foreground">
                    {detailedEvent.interestedCount}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button size="lg" className="w-full font-semibold">
                  Join Event
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-semibold"
                >
                  Add to calendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Separator className="my-12" />

      <section>
        <div className="max-w-none">
          <h3 className="mb-4 font-serif text-2xl font-bold">
            About this event
          </h3>
          {detailedEvent.description ? (
            <div className="grid">
              <div className="space-y-6 rounded-xl border bg-card p-6 md:p-8">
                {detailedEvent.description
                  .split(/\n{2,}/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p
                      key={`${detailedEvent.title}-${index}`}
                      className="whitespace-pre-line text-base leading-8 text-foreground md:text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No event description available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
