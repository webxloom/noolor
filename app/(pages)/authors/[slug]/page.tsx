import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { getAuthorBySlugQuery } from "@/lib/db/authors/authors-queries";
import AuthorDetail from "@/app/components/authors/author-detail";

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

  return (
    <div className="container mx-auto px-4 py-8">
      <AuthorDetail user={data.profile} />
    </div>
  );
}
