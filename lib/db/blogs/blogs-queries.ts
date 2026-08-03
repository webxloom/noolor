import type { SupabaseClient } from "@supabase/supabase-js";

export type BlogRecord = {
  id: string;
  host_id: string;
  title: string;
  slug?: string | null;
  content: string;
  excerpt?: string | null;
  cover_url?: string | null;
  language?: string | null;
  tags?: string[] | null;
  is_published?: boolean | null;
  published_at?: string | null;
  created_at?: string | null;
};

export type BlogInsert = Omit<BlogRecord, "created_at" | "id"> & {
  id?: string;
};

export type BlogUpdate = Partial<Omit<BlogInsert, "host_id">>;

// Get all blogs
export async function getAllBlogsQuery(
  supabase: SupabaseClient,
  limit: number = 100,
) {
  return supabase
    .from("blogs")
    .select(
      `*, host:profiles!blogs_host_id_fkey (
      name,role,avatar_url
    )`,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);
}

export async function getBlogsByUserIdQuery(
  supabase: SupabaseClient,
  userId: string,
) {
  return supabase
    .from("blogs")
    .select("*")
    .eq("host_id", userId)
    .order("created_at", { ascending: false });
}

// Get blogs by roleId and role (author or publication)
export async function getBlogsByHostIdQuery(
  supabase: SupabaseClient,
  hostId: string,
) {
  return supabase
    .from("blogs")
    .select("*")
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });
}

export async function getPublishedBlogsQuery(supabase: SupabaseClient) {
  return supabase
    .from("blogs")
    .select(`*, profile:profiles(name, avatar_url)`)
    .order("created_at", { ascending: false });
}

export async function getPublishedBlogBySlugQuery(
  supabase: SupabaseClient,
  slug: string,
  publishedBefore = new Date().toISOString(),
) {
  const { data: blogDetail, error } = await supabase
    .from("blogs")
    .select(`*, profile:profiles( name, role)`)
    .eq("slug", slug)
    .eq("is_published", true)
    .lte("published_at", publishedBefore)
    .maybeSingle<BlogRecord & { profile: { name?: string; role?: string } }>();

  if (error) {
    console.error("Error fetching blog by slug:", error);
    return { data: null, error };
  }

  const authorId = blogDetail?.host_id;
  const isPublication = blogDetail?.profile?.role?.includes("publication");
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
    data: { blog: blogDetail, authorSlug: authorDetail?.slug ?? null },
    error: null,
  };
}

export async function createBlogQuery(
  supabase: SupabaseClient,
  blog: BlogInsert,
) {
  return supabase.from("blogs").insert(blog).select().single<BlogRecord>();
}

export async function updateBlogQuery(
  supabase: SupabaseClient,
  blogId: string,
  patch: BlogUpdate,
) {
  return supabase
    .from("blogs")
    .update(patch)
    .eq("id", blogId)
    .select()
    .single<BlogRecord>();
}

export async function deleteBlogQuery(
  supabase: SupabaseClient,
  blogId: string,
) {
  return supabase.from("blogs").delete().eq("id", blogId);
}
