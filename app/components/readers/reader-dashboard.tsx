import Link from "next/link";
import {
  ArrowRight,
  BookHeart,
  BookMarked,
  BookOpen,
  Compass,
  Flame,
  MessageSquare,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { ReaderProfileProvider } from "@/app/contexts/reader-context";
import { useReaderProfile } from "@/app/hooks/reader/use-reader-profile";
import { DashboardUser } from "@/app/hooks/use-profile-session";
import AuthorImage from "../authors/author-image";
import { Tabs } from "../ui/tabs";
import { useState } from "react";
import ReaderTabs from "./reader-tabs";
import ReaderContents from "./reader-contents";

type ReaderDashboardProps = {
  user: DashboardUser;
};

const snapshot = [
  {
    label: "Books this year",
    value: "18",
    detail: "+4 from last month",
    icon: BookOpen,
  },
  {
    label: "Reading streak",
    value: "12 days",
    detail: "Keep it going",
    icon: Flame,
  },
  {
    label: "Wishlist",
    value: "27 titles",
    detail: "5 newly saved",
    icon: BookMarked,
  },
  {
    label: "Reviews posted",
    value: "9",
    detail: "2 awaiting replies",
    icon: MessageSquare,
  },
];

const currentReads = [
  {
    author: "Indra Soundar Rajan",
    progress: 68,
    title: "Secrets of the Temple Corridor",
  },
  {
    author: "Salma",
    progress: 42,
    title: "Women, Memory, and the Quiet Street",
  },
  {
    author: "Perumal Murugan",
    progress: 84,
    title: "Songs for the Dry Fields",
  },
];

const recommendations = [
  {
    genre: "Modern Tamil Fiction",
    reason: "Because you finished 3 social novels this month",
    title: "Rain over Chidambaram",
  },
  {
    genre: "Literary Essays",
    reason: "Matches your note-taking and review pattern",
    title: "Margins of Language",
  },
  {
    genre: "Poetry",
    reason: "Popular among readers in your Tamil circle",
    title: "Letters to the Monsoon",
  },
];

const communityMoments = [
  "Readers Circle: Tamil short fiction discussion on Friday, 7 PM",
  "2 new replies on your review of The Silent Palm Leaves",
  "Madurai Heritage Group added a fresh reading list",
];

const shelves = [
  { label: "Want to Read", value: "14", href: "/books" },
  { label: "Currently Reading", value: "3", href: "/books" },
  { label: "Finished", value: "52", href: "/books" },
  { label: "Saved Quotes", value: "31", href: "/profile" },
];

export function ReaderDashboard({ user }: ReaderDashboardProps) {
  const profile = useReaderProfile(user);
  const [activeTab, setActiveTab] = useState("about");

  function handleTabChange(value: string) {
    setActiveTab(value);
    // window.localStorage.setItem(`${profileTabStoragePrefix}${user.id}`, value);
  }

  return (
    <ReaderProfileProvider value={profile}>
      {/* Reader details */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
        {/* Reader Image */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="max-w-md mx-auto lg:max-w-none lg:mx-0">
            <AuthorImage
              image={user.avatar_url}
              canEdit={true}
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
            <ReaderTabs />

            {/* Content */}
            <ReaderContents
              value={activeTab}
              canEdit={true}
              profile={profile}
            />
          </Tabs>
        </div>
      </div>
    </ReaderProfileProvider>
  );
}
