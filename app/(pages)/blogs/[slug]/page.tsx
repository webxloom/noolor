import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { BookOpen, CalendarDays, Clock3, Tag } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { getPublishedBlogBySlugQuery } from "@/lib/db/blogs/blogs-queries";
import Link from "next/link";

type DetailedBlog = {
  // authorAvatar?: string;
  authorName: string;
  authorSlug?: string;
  content: string;
  coverUrl?: string;
  excerpt: string;
  language: string;
  publishedAt?: string;
  tags: string[];
  title: string;
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

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();

  const { data: blogDetail, error } = await getPublishedBlogBySlugQuery(
    supabase,
    slug,
  );

  if (error || !blogDetail) {
    notFound();
  }

  const { blog, authorSlug } = blogDetail;

  const detailedBlog: DetailedBlog = {
    authorName: blog?.profile.name ?? "Unknown author",
    authorSlug: authorSlug ?? undefined,
    content: blog?.content ?? "No content available.",
    coverUrl: blog?.cover_url ?? undefined,
    excerpt: blog?.excerpt ?? "No excerpt has been added.",
    language: blog?.language ?? "Unknown",
    publishedAt: blog?.published_at ?? undefined,
    tags: Array.isArray(blog?.tags) ? blog.tags : [],
    title: blog?.title ?? "Untitled",
    role:
      blog?.profile?.role === "writer"
        ? "writer"
        : blog?.profile?.role === "publication"
          ? "publication"
          : "reader",
  };

  const readingTime = Math.max(
    1,
    Math.ceil(detailedBlog.content.split(/\s+/).length / 220),
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <article className="mb-16 flex flex-col gap-12 md:flex-row">
        <div className="w-full flex-shrink-0 md:w-1/3">
          <div className="sticky top-24 overflow-hidden rounded-xl border bg-muted shadow-lg">
            <div className="relative aspect-[2/3]">
              {detailedBlog.coverUrl ? (
                <Image
                  src={detailedBlog.coverUrl}
                  alt={detailedBlog.title}
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
            <Badge variant="outline">{detailedBlog.language}</Badge>
          </div>

          <h1 className="mb-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {detailedBlog.title}
          </h1>

          <p className="mb-6 flex items-center gap-2 text-xl text-muted-foreground">
            By{" "}
            <Link
              href={
                detailedBlog.role === "writer"
                  ? `/authors/${detailedBlog.authorSlug}`
                  : `/publications/${detailedBlog.authorSlug}`
              }
              className="flex items-center gap-2 font-medium text-foreground hover:underline"
            >
              <span className="font-medium text-foreground">
                {detailedBlog.authorName}
              </span>
            </Link>
          </p>

          <div className="mb-8 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>

            {detailedBlog.publishedAt ? (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {new Date(detailedBlog.publishedAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>
            ) : null}

            {detailedBlog.tags.length > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>
                  {`${detailedBlog.tags.length} tag${detailedBlog.tags.length === 1 ? "" : "s"}`}
                </span>
              </div>
            )}
          </div>

          <div className="max-w-none">
            <h3 className="mb-4 font-serif text-2xl font-bold">Excerpt</h3>
            <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
              {detailedBlog.excerpt}
            </p>
          </div>
        </div>
      </article>

      <Separator className="my-12" />

      <section>
        <h2 className="mb-8 font-serif text-3xl font-bold">Full Article</h2>
        <div className="grid">
          <div className="space-y-6 rounded-xl border bg-card p-6 md:p-8">
            {detailedBlog.content
              .split(/\n{2,}/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p
                  key={`${detailedBlog.title}-${index}`}
                  className="whitespace-pre-line text-base leading-8 text-foreground md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
