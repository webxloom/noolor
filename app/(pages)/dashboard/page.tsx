"use client";

import { useProfileSession } from "@/app/hooks/use-profile-session";

// Components
import { ReaderDashboard } from "@/app/components/readers/reader-dashboard";
import { Card, CardContent } from "@/app/components/ui/card";
import { WriterDashboard } from "@/app/components/authors/author-dashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { profileUser, isLoading } = useProfileSession();
  const router = useRouter();
  useEffect(() => {
    if (!profileUser && !isLoading) {
      router.replace("/login");
    }

    if (profileUser && profileUser.role === "admin") {
      router.replace("/admin-dashboard");
    }
  }, [profileUser, isLoading, router]);

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

  if (!profileUser) {
    // If there's no profile (and not loading), redirect effect runs; avoid rendering dashboards.
    return null;
  }

  const role = profileUser?.role || "reader";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* reader */}
      {role === "reader" && <ReaderDashboard user={profileUser} />}

      {/* Author / Publication */}
      {(role === "writer" || role === "publication") && (
        <WriterDashboard user={profileUser} />
      )}
    </div>
  );
}
