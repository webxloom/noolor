import type { SupabaseClient } from "@supabase/supabase-js";

export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  event_type: string;
  host_id: string;
  start_at: string;
  end_at?: string | null;
  event_mode: string;
  venue_name?: string;
  venue_address?: string;
  city?: string;
  meeting_url?: string;
  status: string;
  visibility: string;
  interested_count?: number;
  going_count?: number;
  created_at: string;
};

export type EventInsert = Omit<EventRecord, "created_at" | "id" | "slug"> & {
  id?: string;
  slug?: string;
};

export type EventCreate = Omit<EventInsert, "slug">;

export type EventUpdate = Partial<Omit<EventInsert, "host_id">>;

// Get all blogs
export async function getAllEventsQuery(
  supabase: SupabaseClient,
  limit: number = 100,
) {
  return supabase
    .from("events")
    .select(
      `*, host:profiles!events_host_id_fkey (
      name,role,avatar_url
    )`,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);
}

export async function getEventsQuery(supabase: SupabaseClient) {
  return supabase
    .from("events")
    .select(`*, profile:profiles(name, avatar_url)`)
    .order("created_at", { ascending: false });
}

export async function getEventsByProfileIdQuery(
  supabase: SupabaseClient,
  profileId: string,
) {
  return supabase
    .from("events")
    .select("*")
    .eq("host_id", profileId)
    .order("created_at", { ascending: false });
}
export async function getEventsByHostIdQuery(
  supabase: SupabaseClient,
  profileId: string,
) {
  return supabase
    .from("events")
    .select("*")
    .eq("host_id", profileId)
    .order("created_at", { ascending: false });
}

export async function createEventQuery(
  supabase: SupabaseClient,
  book: EventCreate,
) {
  return supabase.from("events").insert(book).select().single<EventRecord>();
}

export async function getEventBySlugQuery(
  supabase: SupabaseClient,
  slug: string,
) {
  const { data: eventDetail, error } = await supabase
    .from("events")
    .select(`*, profile:profiles( name, role)`)
    .eq("slug", slug)
    .maybeSingle<EventRecord & { profile: { name?: string; role?: string } }>();

  if (error) {
    console.error("Error fetching blog by slug:", error);
    return { data: null, error };
  }

  const authorId = eventDetail?.host_id;
  const isPublication = eventDetail?.profile?.role === "publication";
  let authorDetail = null;

  if (authorId) {
    if (isPublication) {
      const { data: publicationData, error: publicationError } = await supabase
        .from("publications")
        .select("slug")
        .eq("profile_id", authorId)
        .maybeSingle();
      if (publicationError) {
        console.error("Error fetching publication by ID:", publicationError);
        return { data: null, error: publicationError };
      }
      authorDetail = publicationData;
    } else {
      const { data: authorData, error: authorError } = await supabase
        .from("authors")
        .select("slug")
        .eq("profile_id", authorId)
        .maybeSingle();
      if (authorError) {
        console.error("Error fetching author by ID:", authorError);
        return { data: null, error: authorError };
      }
      authorDetail = authorData;
    }
  }

  return {
    data: { event: eventDetail, authorSlug: authorDetail?.slug ?? null },
    error: null,
  };
}

export async function updateEventQuery(
  supabase: SupabaseClient,
  eventId: string,
  patch: EventUpdate,
) {
  return supabase
    .from("events")
    .update(patch)
    .eq("id", eventId)
    .select()
    .maybeSingle<EventRecord>();
}

export async function deleteEventQuery(
  supabase: SupabaseClient,
  eventId: string,
) {
  return supabase.from("events").delete().eq("id", eventId);
}
