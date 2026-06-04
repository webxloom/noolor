import { EventInsert, EventRecord } from "@/lib/db/events/events-queries";

export type WriterBooksTabProps = {
  user: {
    id: string;
    name: string;
  };
};

export type EventStatus =
  | "draft"
  | "upcoming"
  | "published"
  | "cancelled"
  | "postponed";

export type EventFormState = {
  title: string;
  description?: string;
  coverImage?: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  eventMode: string;
  venueName?: string;
  venueAddress?: string;
  city?: string;
  meetingUrl?: string;
  status: string;
  visibility: string;
  interestedCount?: number;
  goingCount?: number;
};

export type EventAssetField = "coverImage";

export function buildEmptyEventForm(): EventFormState {
  return {
    title: "",
    description: "",
    coverImage: "",
    eventType: "",
    startDate: "",
    endDate: "",
    eventMode: "offline",
    venueName: "",
    venueAddress: "",
    city: "",
    meetingUrl: "",
    status: "draft",
    visibility: "public",
    interestedCount: 0,
    goingCount: 0,
  };
}

export function formatDateTimeLocal(date: string | null | undefined) {
  if (!date) return "";

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function mapEventToForm(event: EventRecord): EventFormState {
  return {
    title: event.title,
    description: event.description ? event.description.trim() : "",
    coverImage: event.cover_image ? event.cover_image.trim() : "",
    eventType: event.event_type,
    startDate: formatDateTimeLocal(event.start_at),
    endDate: event.end_at ? formatDateTimeLocal(event.end_at) : "",
    eventMode: event.event_mode,
    venueName: event.venue_name ? event.venue_name.trim() : "",
    venueAddress: event.venue_address ? event.venue_address.trim() : "",
    city: event.city ? event.city.trim() : "",
    meetingUrl: event.meeting_url ? event.meeting_url.trim() : "",
    status: event.status,
    visibility: event.visibility,
    interestedCount: event.interested_count ? event.interested_count : 0,
    goingCount: event.going_count ? event.going_count : 0,
  };
}

export function buildEventPayload(
  profileId: string,
  form: EventFormState,
): EventInsert {
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return {
    slug: slugify(form.title),
    title: form.title,
    description: form.description ? form.description.trim() : "",
    cover_image: form.coverImage ? form.coverImage.trim() : "",
    event_type: form.eventType,
    host_user_id: profileId,
    start_at: new Date(form.startDate).toISOString(),
    end_at: form.endDate ? new Date(form.endDate).toISOString() : null,
    event_mode: form.eventMode,
    venue_name: form.venueName ? form.venueName.trim() : "",
    venue_address: form.venueAddress ? form.venueAddress.trim() : "",
    city: form.city ? form.city.trim() : "",
    meeting_url: form.meetingUrl ? form.meetingUrl.trim() : "",
    status: form.status,
    visibility: form.visibility,
    interested_count: form.interestedCount ? form.interestedCount : 0,
    going_count: form.goingCount ? form.goingCount : 0,
  };
}

export const EVENT_STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "upcoming", label: "Upcoming" },
  { value: "cancelled", label: "Cancelled" },
  { value: "postponed", label: "Postponed" },
];

export const EVENT_VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];
