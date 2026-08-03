"use client";
import { useState } from "react";

// Contexts & Hooks
import { PublicationContextProvider } from "@/app/contexts/publication-context";
import { usePublicationProfile } from "@/app/hooks/use-publication-profile";

// Components
import RoleCompletionCriteria from "../../user-dashboard/role-completion-criteria";
import RoleImage from "../../user-dashboard/role-image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { BooksList } from "../../books/books-list";
import { BlogsList } from "../../blogs/blogs-list";
import { EventsList } from "../../events/events-list";
import PublicationDetail from "../publication-detail";

const tabs = [
  { value: "about", label: "Bio" },
  { value: "books", label: "Books" },
  { value: "blogs", label: "Blogs" },
  { value: "events", label: "Events" },
];

export default function PublicationDashboard({
  userId,
  canEdit = false,
}: {
  userId: string;
  canEdit?: boolean;
}) {
  const profile = usePublicationProfile(userId);
  const role = "publication";
  const { form } = profile;
  const [activeTab, setActiveTab] = useState("about");

  function handleTabChange(value: string) {
    setActiveTab(value);
  }

  const bioStatus = Boolean(
    form.publication_name && form.bio && (form.location || form.phone),
  );

  return (
    <PublicationContextProvider value={profile}>
      {/* Author completion progress */}
      {canEdit && (
        <RoleCompletionCriteria
          roleId={profile?.publicationId || null}
          role={role}
          bioStatus={bioStatus}
          isActive={form.is_active}
        />
      )}

      {/* Author details */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
        {/* Author Image */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="max-w-md mx-auto lg:max-w-none lg:mx-0">
            <RoleImage
              image={form.avatar_url}
              canEdit={canEdit}
              roleId={userId}
              role={role}
            />
          </div>
        </div>

        {/* Author Info */}
        <div className="rounded-lg border bg-background/80 flex-1 min-w-0">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-3 sm:space-y-4"
          >
            {/* Tabs */}
            <TabsList className="h-auto w-full justify-start gap-1 sm:gap-2 overflow-x-auto border border-border/70 bg-card p-1.5 sm:p-2 scrollbar-hide flex-nowrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="cursor-pointer hover:bg-primary/50 hover:text-primary text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Content */}
            <TabsContent value={activeTab} className="space-y-6">
              {activeTab === "about" ? (
                <PublicationDetail canEdit={canEdit} />
              ) : activeTab === "books" ? (
                <BooksList
                  canEdit={canEdit}
                  roleId={profile.publicationId || ""}
                  role={role}
                />
              ) : activeTab === "blogs" ? (
                <BlogsList canEdit={canEdit} hostId={userId} role={role} />
              ) : activeTab === "events" ? (
                <EventsList canEdit={canEdit} hostId={userId} role={role} />
              ) : null}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicationContextProvider>
  );
}
