import Link from "next/link";
import { Trophy } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "../../ui/card";
import {
  DetailedAuthor,
  type DetailedAuthorAward,
} from "@/app/(pages)/authors/[slug]/page";

function formatAwardTitle(award: DetailedAuthorAward) {
  return award.year ? `${award.title} (${award.year})` : award.title;
}

export default function DetailAwards({ author }: { author: DetailedAuthor }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">
          Awards & Recognition
        </CardTitle>
        <CardDescription>
          Honors and recognitions listed on the author profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {author.awards.length > 0 ? (
          <div className="space-y-4">
            {author.awards.map((award) => (
              <div
                key={`${award.title}-${award.year ?? "na"}-${award.fileUrl ?? "nofile"}`}
                className="flex items-start gap-4 rounded-2xl border bg-background p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-foreground">
                    {formatAwardTitle(award)}
                  </p>
                  {award.fileUrl ? (
                    <Link
                      href={award.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      View award file
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-card/40 py-12 text-center text-muted-foreground">
            No awards have been added yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
