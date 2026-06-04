"use client";
import { useState } from "react";
import { Tabs } from "../ui/tabs";
import { AuthorProfileProvider } from "@/app/contexts/profile-context";
import { useAuthorProfile } from "@/app/hooks/author/use-author-profile";
import AuthorContents from "./author-contents";
import AuthorImage from "./author-image";
import AuthorTabs from "./author-tabs";

export default function AuthorDetail({ user }: { user: any }) {
  const profile = useAuthorProfile(user);
  const [activeTab, setActiveTab] = useState("about");

  function handleTabChange(value: string) {
    setActiveTab(value);
    // window.localStorage.setItem(`${profileTabStoragePrefix}${user.id}`, value);
  }

  return (
    <AuthorProfileProvider value={profile}>
      {/* Author details */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
        {/* Author Image */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="max-w-md mx-auto lg:max-w-none lg:mx-0">
            <AuthorImage
              image={user.avatar_url}
              canEdit={false}
              profileId={user.id}
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
              canEdit={false}
              profile={profile}
            />
          </Tabs>
        </div>
      </div>
    </AuthorProfileProvider>
  );
}
