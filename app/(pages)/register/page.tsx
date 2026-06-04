"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfileSession } from "@/app/hooks/use-profile-session";
import Register from "@/app/components/register";

export default function RegisterPage() {
  const { profileUser, isLoading } = useProfileSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("invite");

  useEffect(() => {
    if (profileUser) router.push("/dashboard");
  }, [profileUser, router]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full border rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (profileUser) {
    // If there's profile (and not loading), redirect effect runs; avoid rendering dashboards.
    return null;
  }

  return <Register inviteId={inviteId ?? undefined} />;
}
