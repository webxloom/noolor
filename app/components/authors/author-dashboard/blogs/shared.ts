import type { BlogInsert, BlogRecord } from "@/lib/db/blogs/blogs-queries";
import type { BlogFormState, BlogStatus } from "@/lib/types/blogs";

export function buildEmptyBlogForm(): BlogFormState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverUrl: "",
    language: "Tamil",
    tags: [],
    isPublished: false,
    publishedAt: "",
  };
}

export function slugifyBlogTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function mapBlogToForm(blog: BlogRecord): BlogFormState {
  return {
    title: blog.title ?? "",
    slug: blog.slug ?? "",
    excerpt: blog.excerpt ?? "",
    content: blog.content ?? "",
    coverUrl: blog.cover_url ?? "",
    language: blog.language ?? "Tamil",
    tags: Array.isArray(blog.tags) ? blog.tags : [],
    isPublished: Boolean(blog.is_published),
    publishedAt: blog.published_at
      ? new Date(blog.published_at).toISOString().slice(0, 16)
      : "",
  };
}

export function buildBlogPayload(
  authorId: string,
  form: BlogFormState,
): BlogInsert {
  const nextSlug = form.slug.trim() || slugifyBlogTitle(form.title);
  const publishedAt = form.isPublished
    ? form.publishedAt
      ? new Date(form.publishedAt).toISOString()
      : new Date().toISOString()
    : null;

  return {
    author_id: authorId,
    title: form.title.trim(),
    slug: nextSlug || null,
    excerpt: form.excerpt.trim() || null,
    content: form.content.trim(),
    cover_url: form.coverUrl.trim() || null,
    language: form.language,
    tags: form.tags.length > 0 ? form.tags : [],
    is_published: form.isPublished,
    published_at: publishedAt,
  };
}

export function getBlogStatus(blog: BlogRecord): Exclude<BlogStatus, "all"> {
  if (!blog.is_published) {
    return "draft";
  }

  if (blog.published_at && new Date(blog.published_at).getTime() > Date.now()) {
    return "scheduled";
  }

  return "published";
}

export function getBlogStatusVariant(
  status: Exclude<BlogStatus, "all">,
): "default" | "secondary" | "outline" {
  if (status === "draft") return "outline";
  if (status === "scheduled") return "secondary";
  return "default";
}

export function matchesBlogSearch(blog: BlogRecord, search: string) {
  const haystack = [
    blog.title,
    blog.slug,
    blog.excerpt,
    blog.language,
    blog.tags?.join(" "),
    blog.content,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}
