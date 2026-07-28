"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useProfileSession } from "@/app/hooks/use-profile-session";
import { capitalizeFirstLetter } from "@/lib/utils";

function Card({ href, title, subtitle, children }: any) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border bg-background/80 p-6 hover:shadow-lg transition flex flex-col justify-between"
    >
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {children && (
        <div className="mt-4 text-sm text-muted-foreground">{children}</div>
      )}
    </Link>
  );
}

export default function DashboardPage() {
  const { profileUser } = useProfileSession();
  const otherRoles = profileUser?.other_roles ?? [];
  const router = useRouter();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleContinue = () => {
    if (selectedRoles.length === 0) return;

    // Navigate based on selected roles
    if (
      selectedRoles.includes("author") &&
      selectedRoles.includes("publication")
    ) {
      // Both selected - navigate to author first or a selection page
      router.push("/authors");
    } else if (selectedRoles.includes("author")) {
      router.push("/authors");
    } else if (selectedRoles.includes("publication")) {
      router.push("/publications");
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Profile and Reader Profile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          href="/dashboard/profile"
          title="Basic Profile"
          subtitle="View and edit your basic profile details"
        />

        <Card
          href="/profile"
          title="Reader Profile"
          subtitle="Manage your reader settings & preferences"
        />
      </div>

      {/* Role Cards or Role Selection */}
      {otherRoles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherRoles.map((role) => {
            const href = role === "author" ? "/authors" : "/publications";
            const title =
              role === "author" ? "Author Profile" : "Publication Profile";
            const subtitle =
              role === "author"
                ? "Manage your author dashboard"
                : "Manage your publication dashboard";

            return (
              <Card key={role} href={href} title={title} subtitle={subtitle} />
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border bg-background/80 p-6">
          <h3 className="text-lg font-semibold">Choose Your Role</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Unlock additional features by becoming an author or publication.
            Share your stories and connect with readers.
          </p>
          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition">
              <input
                type="checkbox"
                checked={selectedRoles.includes("author")}
                onChange={() => handleRoleToggle("author")}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div>
                <span className="font-medium">Become an Author</span>
                <p className="text-sm text-muted-foreground">
                  Share your stories and publish content
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition">
              <input
                type="checkbox"
                checked={selectedRoles.includes("publication")}
                onChange={() => handleRoleToggle("publication")}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div>
                <span className="font-medium">Become a Publication</span>
                <p className="text-sm text-muted-foreground">
                  Manage publications and teams
                </p>
              </div>
            </label>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedRoles.length === 0}
            className="w-full px-4 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Continue
          </button>
        </div>
      )}

      {/* Subscription Upgrade Card */}
      <div className="rounded-lg p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
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
            className="inline-flex items-center px-5 py-2.5 rounded-md bg-white text-indigo-600 font-medium hover:bg-white/90 transition whitespace-nowrap"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
