import { useState } from "react";
import {
  Bell,
  BookMarked,
  MessageSquare,
  ScrollText,
  Star,
  Users,
} from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Tabs, TabsContent } from "@/app/components/ui/tabs";
import { AuthorBlogsTab } from "@/app/components/authors/author-dashboard/blogs";
import { AuthorBooksTab } from "@/app/components/authors/author-dashboard/books";
import { AuthorProfileTab } from "@/app/components/authors/author-dashboard/profile";
import { AUTHOR_SECTIONS } from "@/lib/constants/authors";
import AuthorSummaryCard from "../summary-card";
import AuthorOverview from "../overview";

export type WriterDashboardProps = {
  user: {
    avatarUrl?: string;
    id: string;
    isPremium?: boolean;
    languages?: string[];
    name: string;
  };
};

const reviews = [
  {
    title: "Letters to the Salt Wind",
    score: "4.9",
    excerpt:
      "Readers keep citing the emotional precision of the final chapter.",
  },
  {
    title: "Night Jasmine Stories",
    score: "4.7",
    excerpt: "Strong classroom adoption and thoughtful long-form reviews.",
  },
  {
    title: "Margins of Monsoon",
    score: "4.6",
    excerpt:
      "Early reviewers want more author notes and behind-the-scenes context.",
  },
];

const communities = [
  {
    group: "South India Fiction Circle",
    role: "Moderator",
    note: "Hosting a discussion on historical voice next week",
  },
  {
    group: "Emerging Essayists Guild",
    role: "Mentor",
    note: "6 new manuscripts requested feedback",
  },
  {
    group: "Poetry & Translation Lab",
    role: "Member",
    note: "Shared 2 translated excerpts this week",
  },
];

const notifications = [
  "A reviewer with 22K followers posted a featured response to your latest novel.",
  "Marina Review tagged you in a publication collaboration thread.",
  "126 new readers followed your profile after yesterday's blog post.",
  "Your community event reminder is scheduled for Thursday at 6:00 PM.",
];

const writerDashboardTabStoragePrefix = "writer-dashboard-active-section:";

function getInitialSection(userId: string) {
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
  const [activeSection, setActiveSection] = useState(() =>
    getInitialSection(user.id),
  );

  function handleSectionChange(value: string) {
    setActiveSection(value);
    window.localStorage.setItem(
      `${writerDashboardTabStoragePrefix}${user.id}`,
      value,
    );
  }

  return (
    <Tabs
      value={activeSection}
      onValueChange={handleSectionChange}
      className="grid gap-6 xl:grid-cols-[412px_minmax(0,1fr)] xl:items-start"
    >
      {/* Summary card */}
      <AuthorSummaryCard
        user={user}
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
      />

      <div className="space-y-6 pl-10">
        <TabsContent value="overview" className="space-y-6">
          <AuthorOverview />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <AuthorProfileTab user={user} />
        </TabsContent>

        <TabsContent value="books" className="space-y-6">
          <AuthorBooksTab user={user} />
        </TabsContent>

        <TabsContent value="blogs" className="space-y-6">
          <AuthorBlogsTab user={user} />
        </TabsContent>

        <TabsContent
          value="reviews"
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">
                Reviews and ratings management
              </CardTitle>
              <CardDescription>
                Keep track of sentiment, standout praise, and follow-up
                opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.title}
                  className="rounded-2xl border bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">
                      {review.title}
                    </p>
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      {review.score}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {review.excerpt}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">
                Suggested responses
              </CardTitle>
              <CardDescription>
                Sample moderation and engagement prompts for the writer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Thank high-signal reviewers and link them to related work",
                "Flag recurring feedback themes for future editions",
                "Surface five-star excerpts on the public portfolio",
                "Invite thoughtful reviewers into group discussions",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border px-4 py-3 text-sm text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="groups"
          className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge className="border-0 bg-primary/10 text-primary">
                  Coming soon
                </Badge>
              </div>
              <CardTitle className="font-serif text-2xl">
                Community groups workspace
              </CardTitle>
              <CardDescription>
                Group creation, member management, invites, and discussion tools
                will be available here in a future release.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-muted/15 p-5">
                <p className="text-sm font-medium text-foreground">
                  Planned features
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    "Create private or public reader groups",
                    "Assign moderator roles and approvals",
                    "Run chapter discussions and event threads",
                    "Track invites, requests, and participation",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">
                Community preview
              </CardTitle>
              <CardDescription>
                Example spaces the author already participates in today.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {communities.map((community) => (
                <div
                  key={community.group}
                  className="rounded-2xl border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {community.group}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {community.note}
                      </p>
                    </div>
                    <Badge variant="secondary">{community.role}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="notifications"
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">
                Notifications system
              </CardTitle>
              <CardDescription>
                Time-sensitive alerts across readers, collaborators, and
                communities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border bg-background p-4"
                >
                  <Bell className="mt-0.5 h-4 w-4 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">
                Quick actions
              </CardTitle>
              <CardDescription>
                Sample shortcuts for urgent engagement and publishing tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: ScrollText, label: "Approve scheduled blog" },
                { icon: MessageSquare, label: "Reply to top review" },
                { icon: Users, label: "Accept book club request" },
                { icon: BookMarked, label: "Update featured title" },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-muted/20"
                >
                  <action.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {action.label}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
