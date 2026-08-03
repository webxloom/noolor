import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { getPublicationsBySlugQuery } from "@/lib/db/publications/publications-queries";
import PublicationDashboard from "@/app/components/publications/publication-dashboard";

export type DetailedPublicationAward = {
  fileUrl?: string;
  title: string;
  year?: number;
};

export type DetailedPublication = {
  id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
  bookCount: number;
  blogCount: number;
  bio: string;
  awards: DetailedPublicationAward[];
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

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();
  const { data, error } = await getPublicationsBySlugQuery(supabase, slug);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to authors */}
      <div className="mb-4">
        <a
          href="/publications"
          className="text-sm text-primary hover:underline"
        >
          &larr; Back to Publications list
        </a>
      </div>
      <PublicationDashboard userId={data.profile_id} canEdit={false} />
    </div>
  );
}
