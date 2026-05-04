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

type ReaderDashboardProps = {
  user: {
    isPremium?: boolean;
    language?: string;
    name: string;
  };
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
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.18),_transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,244,236,0.95))] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-background/80 text-foreground"
              >
                Reader Dashboard
              </Badge>
              {user.isPremium ? (
                <Badge className="border-0 bg-amber-100 text-amber-800">
                  Premium Reader
                </Badge>
              ) : null}
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Welcome back, {user.name}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Your reading corner is ready. Pick up where you left off,
                discover new Tamil and multilingual titles, and stay close to
                the book circles you care about.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Goal: 24 books this year
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
                <Compass className="h-4 w-4 text-primary" />
                Preferred languages: {user.language ?? "Tamil, English"}
              </span>
            </div>
          </div>

          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            {snapshot.slice(0, 2).map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border bg-background/85 p-4 shadow-sm"
              >
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <div className="text-2xl font-semibold text-foreground">
                  {item.value}
                </div>
                <p className="text-xs font-medium text-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {snapshot.map((item) => (
          <Card key={item.label} className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>{item.label}</CardDescription>
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl">
                Continue Reading
              </CardTitle>
              <CardDescription>
                Jump back into the books you were most engaged with this week.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/books">
                Open library <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentReads.map((book) => (
              <div
                key={book.title}
                className="rounded-2xl border bg-muted/20 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{book.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {book.author}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/books">Resume</Link>
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{book.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-primary/15">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Your Shelves</CardTitle>
            <CardDescription>
              Quick entry points into your reading workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {shelves.map((shelf) => (
              <Link
                key={shelf.label}
                href={shelf.href}
                className="flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/20"
              >
                <span className="text-sm font-medium text-foreground">
                  {shelf.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {shelf.value}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl">
                Recommended for You
              </CardTitle>
              <CardDescription>
                A practical first pass at personalized discovery.
              </CardDescription>
            </div>
            <BookHeart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <Badge variant="outline">{item.genre}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.reason}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl">
                Community and Notes
              </CardTitle>
              <CardDescription>
                Activity that keeps the reader role social and sticky.
              </CardDescription>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            {communityMoments.map((item) => (
              <div
                key={item}
                className="rounded-2xl border bg-muted/20 px-4 py-3 text-sm text-foreground"
              >
                {item}
              </div>
            ))}
            <div className="rounded-2xl border bg-amber-50/70 p-4">
              <div className="flex items-start gap-3">
                <Star className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <p className="font-medium text-foreground">
                    Reader upgrade idea
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Unlock private notes, deeper recommendations, and curated
                    premium reading paths once premium reader features are live.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
