import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { getAuthorBySlugQuery } from "@/lib/db/authors/authors-queries";
import type { AuthorRecord } from "@/lib/types/authors";
import AuthorDetail from "@/app/components/authors/detail-page/author-detail";

export type DetailedAuthorAward = {
  fileUrl?: string;
  title: string;
  year?: number;
};

export type DetailedAuthor = {
  id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
  bookCount: number;
  blogCount: number;
  languages: string[];
  genres: string[];
  bio: string;
  awards: DetailedAuthorAward[];
  upcomingWorks: string[];
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

function mapAuthorToDetailedAuthor(author: AuthorRecord): DetailedAuthor {
  console.log("Mapping author record to detailed author:", author);
  return {
    avatarUrl: author.avatar_url ?? undefined,
    awards:
      author.awards?.map((award) => ({
        fileUrl: award.fileUrl ?? undefined,
        title: award.title,
        year: award.year ?? undefined,
      })) ?? [],
    bio: author.bio ?? "No biography has been added yet.",
    blogCount: 0,
    bookCount: 0,
    genres: author.genres ?? [],
    id: author.id,
    languages: author.languages ?? [],
    location: author.location ?? undefined,
    name: author.name,
    upcomingWorks:
      author.upcoming_works?.map((work) => work.title).filter(Boolean) ?? [],
  };
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();
  const { data, error } = await getAuthorBySlugQuery(supabase, slug);

  if (error || !data) {
    notFound();
  }

  const author = mapAuthorToDetailedAuthor(data);

  return (
    <div className="container mx-auto px-4 py-8">
      <AuthorDetail author={author} />
    </div>
  );
}
