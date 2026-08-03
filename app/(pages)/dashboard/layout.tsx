"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileSession } from "@/app/hooks/use-profile-session";

// Components
import { Card, CardContent } from "@/app/components/ui/card";
import BasicDetails from "@/app/components/user-dashboard/basic-details";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profileUser, isLoading } = useProfileSession();
  const router = useRouter();
  const pathname = usePathname();

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

  const hidebasicDetails =
    pathname.includes("author") || pathname.includes("publication");

  if (hidebasicDetails) {
    return <div className="container mx-auto px-4 py-8">{children}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
        {/* User basic details */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <BasicDetails user={profileUser} />
        </div>

        {/* Dashboard Overview */}
        <div className="rounded-lg border bg-background/50 flex-1 min-w-0 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
