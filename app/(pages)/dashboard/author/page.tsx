"use client";
import AuthorDashboard from "@/app/components/authors/author-dashboard/index";
import { Card, CardContent } from "@/app/components/ui/card";
import { useProfileSession } from "@/app/hooks/use-profile-session";

export default function AuthorDashboardPage() {
  const { profileUser, isLoading } = useProfileSession();

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
    return (
      <div className="mx-auto flex w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-center text-muted-foreground">
          You need to be logged in to access the author dashboard.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Back to dashboard */}
      <div className="mb-4">
        <a href="/dashboard" className="text-sm text-primary hover:underline">
          &larr; Back to dashboard
        </a>
      </div>
      <AuthorDashboard userId={profileUser.id} canEdit={true} />
    </div>
  );
}
