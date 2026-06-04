import { useState } from "react";

// Hooks / Contexts
import { AuthorProfileProvider } from "@/app/contexts/profile-context";
import { useAuthorProfile } from "@/app/hooks/author/use-author-profile";

// Types / Constants
import { AUTHOR_SECTIONS } from "@/lib/constants/authors";

// Components
import AuthorContents from "./author-contents";
import AuthorCriteria from "./author-criteria";
import AuthorImage from "./author-image";
import AuthorTabs from "./author-tabs";
import { Tabs } from "@/app/components/ui/tabs";
import { DashboardUser } from "@/app/hooks/use-profile-session";

export type WriterDashboardProps = {
  user: DashboardUser;
};

const writerDashboardTabStoragePrefix = "writer-dashboard-active-section:";

export function getInitialSection(userId: string) {
  if (typeof window === "undefined") {
    return "overview";
  }

  const storedValue = window.localStorage.getItem(
    `${writerDashboardTabStoragePrefix}${userId}`,
  );

  return storedValue &&
    AUTHOR_SECTIONS.some((section) => section.value === storedValue)
    ? storedValue
    : "overview";
}

export function WriterDashboard({ user }: WriterDashboardProps) {
  const profile = useAuthorProfile(user);
  const [activeTab, setActiveTab] = useState("about");
  const userRole = user.role?.toLowerCase() || "";
  const isPublication = userRole.includes("publication");

  function handleTabChange(value: string) {
    setActiveTab(value);
    // window.localStorage.setItem(`${profileTabStoragePrefix}${user.id}`, value);
  }

  return (
    <AuthorProfileProvider value={profile}>
      {/* Author completion progress */}
      <AuthorCriteria
        authorId={profile?.authorId}
        isPublication={isPublication}
      />

      {/* Author details */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
        {/* Author Image */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="max-w-md mx-auto lg:max-w-none lg:mx-0">
            <AuthorImage
              image={user.avatar_url}
              canEdit={true}
              profileId={user.id}
              isPublication={isPublication}
            />
          </div>
        </div>

        {/* Author Info */}
        <div className="rounded-lg border bg-background/80 flex-1 min-w-0">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-3 sm:space-y-4"
          >
            <AuthorTabs />

            {/* Content */}
            <AuthorContents
              value={activeTab}
              canEdit={true}
              profile={profile}
            />
          </Tabs>
        </div>
      </div>
    </AuthorProfileProvider>
  );
}
