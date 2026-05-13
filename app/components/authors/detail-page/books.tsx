import { BookOpen } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "../../ui/card";
import { DetailedAuthor } from "@/app/(pages)/authors/[slug]/page";

export default function DetailBooks({ author }: { author: DetailedAuthor }) {
  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Published Works</CardTitle>
          <CardDescription>
            Books written by this author will appear here once the books table
            is connected to this route.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed bg-card/40 py-12 text-center text-muted-foreground">
            No books are wired to this public detail page yet.
          </div>
        </CardContent>
      </Card>

      {author.upcomingWorks.length > 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              Upcoming Works
            </CardTitle>
            <CardDescription>
              Titles the author has already announced.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {author.upcomingWorks.map((work) => (
              <div
                key={work}
                className="flex items-start gap-4 rounded-2xl border bg-background p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">{work}</p>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
