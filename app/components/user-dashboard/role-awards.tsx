import { useMemo } from "react";
import { AwardFormItem } from "@/lib/types/authors";
import { Award, Calendar, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

export default function Awards({
  awards,
}: {
  awards: AwardFormItem[] | undefined;
}) {
  const isAwardsEmpty = useMemo(() => {
    return (
      awards?.length === 0 ||
      (awards?.length === 1 &&
        !(
          awards[0].title?.trim() ||
          awards[0].year?.trim() ||
          awards[0].fileUrl
        ))
    );
  }, [awards]);

  return (
    <div className="space-y-6">
      {isAwardsEmpty ? (
        <p className="text-sm text-muted-foreground">No awards added yet.</p>
      ) : (
        awards?.map((award, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-card p-4 transition-all hover:shadow-md"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {award.title || "Untitled Award"}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {award.year || "Year not specified"}
                  </div>
                </div>
              </div>

              {award.fileUrl && (
                <div className="flex gap-2">
                  {/* Open in new tab */}
                  <Button asChild variant="secondary" size="sm">
                    <a
                      href={award.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Certificate
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
