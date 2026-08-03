"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Contexts / Hooks
import { useToast } from "@/app/contexts/toast-context";
import { useProfileSession } from "@/app/hooks/use-profile-session";

// Helpers
import { capitalizeFirstLetter } from "@/lib/utils";
import { insertUserRole } from "@/lib/db/user-roles/queries";

// Components
import UserDashboardRoleCards from "@/app/components/user-dashboard/role-cards";

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { profileUser, refreshProfile } = useProfileSession();
  const otherRoles = profileUser?.other_roles ?? [];

  const isAuthor = otherRoles.includes("author");
  const isPublication = otherRoles.includes("publication");

  const [isLoading, setIsLoading] = useState({
    author: false,
    publication: false,
  });

  const handleRoleClick = async (role: string, redirect: boolean) => {
    const loadingKey = role === "author" ? "author" : "publication";
    const redirectPath =
      role === "author" ? "/dashboard/author" : "/dashboard/publication";
    setIsLoading((prev) => ({ ...prev, [loadingKey]: true }));

    if (redirect) {
      router.push(redirectPath);
    } else {
      const response = await insertUserRole(profileUser?.id || "", role);

      if (response.error) {
        addToast(
          `Failed to create ${role} profile. Please try again.`,
          "error",
        );
        setIsLoading((prev) => ({ ...prev, [loadingKey]: false }));
        return;
      }

      // Refresh the profile to get updated roles
      await refreshProfile();

      addToast(
        `${capitalizeFirstLetter(role)} profile created successfully!`,
        "success",
      );
      router.refresh();
      router.push(redirectPath);
    }
  };

  if (isLoading.author || isLoading.publication) {
    return (
      <div className="mx-auto flex w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex min-h-48 w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-muted animate-spin border-t-primary"></div>
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent animate-pulse"></div>
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">
                {isLoading.author && "Redirecting to Author Profile"}
                {isLoading.publication && "Redirecting to Publication Profile"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait a moment...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col justify-between h-full">
      {/* Role Cards or Role Selection */}
      <UserDashboardRoleCards
        isAuthor={isAuthor}
        isPublication={isPublication}
        handleRoleClick={handleRoleClick}
      />

      {/* Subscription Upgrade Card */}
      <div className="rounded-lg px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Upgrade Your Plan</h3>
            <p className="text-sm opacity-90 mt-1">
              Current plan:{" "}
              <span className="font-semibold">
                {capitalizeFirstLetter(
                  profileUser?.subscription_plan || "Free",
                )}
              </span>
              . Unlock premium features, priority support, and advanced
              analytics.
            </p>
          </div>

          <Link
            href="/pricing"
            className="inline-flex items-center px-5 py-1 rounded-md bg-white text-indigo-600 font-medium hover:bg-white/90 transition whitespace-nowrap"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
