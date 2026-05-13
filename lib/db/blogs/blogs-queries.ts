import type { SupabaseClient } from "@supabase/supabase-js";

export type BlogRecord = {
  id: string;
  user_id: string;
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

export type BlogUpdate = Partial<Omit<BlogInsert, "user_id">>;

export async function getBlogsByUserIdQuery(
  supabase: SupabaseClient,
  userId: string,
) {
  return supabase
    .from("blogs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<BlogRecord[]>();
}

export async function getPublishedBlogsQuery(
  supabase: SupabaseClient,
  publishedBefore = new Date().toISOString(),
) {
  return supabase
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .lte("published_at", publishedBefore)
    .order("published_at", { ascending: false })
    .returns<BlogRecord[]>();
}

export async function getPublishedBlogBySlugQuery(
  supabase: SupabaseClient,
  slug: string,
  publishedBefore = new Date().toISOString(),
) {
  return supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .lte("published_at", publishedBefore)
    .maybeSingle<BlogRecord>();
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
