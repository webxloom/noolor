"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Save } from "lucide-react";

import AboutAuthor from "./about";
import AuthorAwards from "./awards";
import { AuthorProfileProvider } from "../../../../contexts/profile-context";
import AuthorSocialLinks from "./social-links";
import { useAuthorProfile } from "../../../../hooks/use-author-profile";
import { Button } from "../../../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/tabs";
import AuthorUpcomingWorks from "./upcoming-works";
import { AuthorProfileUser } from "@/lib/types/authors";

const profileTabStoragePrefix = "author-profile-active-tab:";

export function AuthorProfileTab({ user }: { user: AuthorProfileUser }) {
  const profile = useAuthorProfile(user);
  const { authorId, handleSubmit, isLoading, isSaving, loadError } = profile;
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") {
      return "about";
    }

    return (
      window.localStorage.getItem(`${profileTabStoragePrefix}${user.id}`) ??
      "about"
    );
  });

  function handleTabChange(value: string) {
    setActiveTab(value);
    window.localStorage.setItem(`${profileTabStoragePrefix}${user.id}`, value);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[320px] gap-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile form...
      </div>
    );
  }

  return (
    <AuthorProfileProvider value={profile}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {loadError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>{loadError}</span>
          </div>
        ) : null}

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl border border-border/70 bg-card p-2">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="social">Social Media & Links</TabsTrigger>
            <TabsTrigger value="awards">Awards & Works</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <AboutAuthor />
          </TabsContent>

          <TabsContent value="awards" className="space-y-6">
            <AuthorAwards />
            <AuthorUpcomingWorks />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <AuthorSocialLinks />
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-end justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {authorId ? "Save author profile" : "Create author profile"}
          </Button>
        </div>
      </form>
    </AuthorProfileProvider>
  );
}
