"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Compass, Sparkles } from "lucide-react";

import { ReaderDashboard } from "@/app/components/readers/reader-dashboard";
import { WriterDashboard } from "@/app/components/authors/author-dashboard/author-dashboard";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  getProfileByIdQuery,
  type ProfileRecord,
} from "@/lib/db/profiles/profile-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type DashboardUser = {
  avatarUrl?: string;
  id: string;
  isPremium: boolean;
  languages?: string[];
  name: string;
  role: ProfileRecord["role"];
};

const demoUser: DashboardUser = {
  id: "demo-reader",
  isPremium: true,
  languages: ["Tamil", "English"],
  name: "Meera Venkatesan",
  role: "writer",
};

function mapProfileToDashboardUser(profile: ProfileRecord): DashboardUser {
  return {
    avatarUrl: profile.avatar_url ?? undefined,
    id: profile.id,
    isPremium: profile.is_premium === true,
    languages:
      profile.languages && profile.languages.length > 0
        ? profile.languages
        : undefined,
    name: profile.name?.trim() || "Reader",
    role: profile.role,
  };
}

export default function DashboardPage() {
  const [profileUser, setProfileUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentSessionUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    async function syncDashboardUser(session: Session | null) {
      if (!isMounted) {
        return;
      }

      currentSessionUserIdRef.current = session?.user?.id ?? null;

      if (!session?.user?.id) {
        setProfileUser(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await getProfileByIdQuery(
        supabase,
        session.user.id,
      );

      if (!isMounted) {
        return;
      }

      if (error || !data) {
        setProfileUser(null);
      } else {
        setProfileUser(mapProfileToDashboardUser(data));
      }

      setIsLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => {
      void syncDashboardUser(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;

      if (nextUserId === currentSessionUserIdRef.current) {
        return;
      }

      setIsLoading(true);
      void syncDashboardUser(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full border-border/70 shadow-sm">
          <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
            Loading dashboard...
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentUser = profileUser ?? demoUser;

  if (currentUser.role === "reader") {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ReaderDashboard user={currentUser} />
      </div>
    );
  }

  if (currentUser.role === "writer") {
    return (
      <div className="container mx-auto px-4 py-8">
        <WriterDashboard user={currentUser} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full border-border/70 shadow-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Demo dashboard routing
          </div>
          <div className="space-y-2">
            <CardTitle className="font-serif text-3xl">
              Role dashboard coming next
            </CardTitle>
            <CardDescription className="mx-auto max-w-2xl text-base leading-7">
              The current demo is implemented for the reader role first. This
              page is already checking the dashboard role and can branch into
              dedicated writer, publication, or admin dashboards when those
              views are ready.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Badge variant="secondary" className="capitalize">
            Current role: {currentUser.role}
          </Badge>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/books">Explore books</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/groups">
                <Compass className="h-4 w-4" />
                Browse groups
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
