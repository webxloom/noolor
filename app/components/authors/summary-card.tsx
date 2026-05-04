"use client";

import { useEffect, useState } from "react";

import { AUTHOR_SECTIONS, SNAPSHOTS } from "@/lib/constants/authors";
import { getAuthorByUserIdQuery } from "@/lib/db/authors/authors-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { WriterDashboardProps } from "./author-dashboard/author-dashboard";

type SnapshotKey = (typeof SNAPSHOTS)[number]["key"];

type SnapshotValues = Record<SnapshotKey, string>;

const defaultSnapshotValues: SnapshotValues = {
  blogs: "0",
  books: "0",
  rating: "0.0",
  reviews: "0",
};

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AuthorSummaryCard({
  user,
  activeSection,
  setActiveSection,
}: {
  user: WriterDashboardProps["user"];
  activeSection: string;
  setActiveSection: (section: string) => void;
}) {
  const [snapshotValues, setSnapshotValues] = useState<SnapshotValues>(
    defaultSnapshotValues,
  );

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    async function loadSnapshotValues() {
      const authorResult = await getAuthorByUserIdQuery(supabase, user.id);

      if (!isMounted) {
        return;
      }

      const authorId = authorResult.data?.id;

      const [booksResult, blogsResult, reviewsResult] = await Promise.all([
        authorId
          ? supabase
              .from("books")
              .select("id", { count: "exact", head: true })
              .eq("author_id", authorId)
          : Promise.resolve({ count: 0, error: null }),
        supabase
          .from("blogs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        authorId
          ? supabase
              .from("reviews")
              .select("id", { count: "exact", head: true })
              .eq("author_id", authorId)
          : Promise.resolve({ count: 0, error: null }),
      ]);

      if (!isMounted) {
        return;
      }

      setSnapshotValues({
        blogs: String(blogsResult.count ?? 0),
        books: String(booksResult.count ?? 0),
        rating:
          typeof authorResult.data?.rating === "number"
            ? authorResult.data.rating.toFixed(1)
            : "0.0",
        reviews: String(reviewsResult.count ?? 0),
      });
    }

    void loadSnapshotValues();

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  return (
    <>
      <aside className="relative xl:sticky xl:top-8 xl:w-[412px]">
        <Card className="relative overflow-visible rounded-[30px] border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,239,229,0.98))] shadow-sm xl:w-[348px]">
          <CardHeader className="space-y-5 p-6">
            <div className="flex items-start justify-between gap-4 pr-10">
              <Badge className="border-0 bg-primary/10 text-primary">
                Author
              </Badge>
              {user.isPremium ? (
                <Badge className="border-0 bg-amber-100 text-amber-800">
                  Premium
                </Badge>
              ) : null}
            </div>

            <div className="space-y-4">
              <Avatar className="h-20 w-20 border border-border/60 shadow-sm">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div>
                  <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                    {user.name}
                  </h1>
                  {user.languages ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.languages.slice(0, 2).map((lang) => (
                        <Badge
                          key={lang}
                          variant="secondary"
                          className="text-xs font-normal rounded-sm"
                        >
                          {lang}
                        </Badge>
                      ))}
                      {user.languages.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal rounded-sm"
                        >
                          +{user.languages.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6 pt-0">
            <div className="space-y-3 rounded-2xl border bg-background/70 p-4 xl:hidden">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Notebook tabs
                </p>
                <span className="text-xs text-muted-foreground">
                  Swipe sections
                </span>
              </div>
              <div className="flex w-full justify-start gap-2 overflow-x-auto pb-1">
                {AUTHOR_SECTIONS.map((section) => (
                  <button
                    key={section.value}
                    type="button"
                    onClick={() => setActiveSection(section.value)}
                    className={`min-w-[132px] rounded-2xl border px-3 py-3 text-left shadow-sm transition-colors ${
                      activeSection === section.value
                        ? "border-primary/40 bg-primary/10"
                        : "border-border/70 bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-8 w-1.5 rounded-full ${section.color}`}
                      />
                      <section.icon className="h-4 w-4 text-foreground" />
                      <span className="text-xs font-semibold leading-tight text-foreground">
                        {section.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SNAPSHOTS.slice(0, 4).map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border bg-background/80 p-3"
                >
                  <item.icon className="mb-2 h-4 w-4 text-primary" />
                  <div className="text-lg font-semibold text-foreground">
                    {snapshotValues[item.key]}
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="pointer-events-none absolute bottom-8 left-[347px] top-8 hidden w-4 bg-[linear-gradient(180deg,rgba(214,198,177,0.9),rgba(241,233,223,0.92))] xl:block" />

        <div className="absolute left-[348px] top-8 hidden xl:flex xl:flex-col xl:gap-2">
          {AUTHOR_SECTIONS.map((section) => (
            <button
              key={section.value}
              type="button"
              onClick={() => setActiveSection(section.value)}
              className={`group flex h-12 w-12 items-center overflow-hidden rounded-r-2xl rounded-l-sm border border-l-0 bg-background/95 shadow-sm transition-all duration-200 ease-out hover:w-[122px] ${
                activeSection === section.value
                  ? "w-[100px] border-primary/40 bg-primary"
                  : "border-border/70"
              }`}
            >
              {activeSection === section.value ? (
                <span className="px-2 text-sm font-semibold text-background">
                  {section.label}
                </span>
              ) : (
                <>
                  <span
                    className={`ml-3 mr-3 inline-block h-9 w-1.5 shrink-0 rounded-full ${section.color}`}
                  />
                  <section.icon className="h-4 w-4 shrink-0 text-foreground" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap pl-0 pr-0 text-sm font-semibold text-foreground opacity-0 transition-all duration-200 group-hover:max-w-[88px] group-hover:pl-2 group-hover:pr-3 group-hover:opacity-100">
                    {section.label}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
