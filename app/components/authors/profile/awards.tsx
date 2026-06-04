"use client";
import { useState, useEffect } from "react";
import { Award, Calendar, ExternalLink, Pencil } from "lucide-react";

import { useAuthorProfileContext } from "@/app/contexts/profile-context";
import { useAuthorAwards } from "@/app/hooks/author/use-author-awards";
import AwardsEditor from "../../shared/awards-editor";
import { Button } from "../../ui/button";

export default function AuthorAwards({
  canEdit,
  isPublication,
}: {
  canEdit: boolean;
  isPublication: boolean;
}) {
  const { form, authorId, setField } = useAuthorProfileContext();

  const {
    awards,
    addAward,
    removeAward,
    updateAward,
    handleAwardFileUpload,
    clearAwardFile,
    setAwards,
    saveAwards,
    isSaving,
    pendingAwardFileNames,
  } = useAuthorAwards(form.awards, isPublication);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // keep hook awards synced when form drafts/loads change
    setAwards(
      form.awards || [
        {
          title: "",
          year: "",
          fileUrl: "",
        },
      ],
    );
  }, [form.awards, setAwards]);

  const isAwardsEmpty =
    awards.length === 0 ||
    (awards.length === 1 &&
      !(
        awards[0].title?.trim() ||
        awards[0].year?.trim() ||
        awards[0].fileUrl
      ));

  if (!isEditing) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-2 space-y-6">
        {isAwardsEmpty ? (
          <p className="text-sm text-muted-foreground">No awards added yet.</p>
        ) : (
          awards.map((award, index) => (
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

        {canEdit && (
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-sm sm:text-base"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit awards
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6 pb-4">
      <AwardsEditor
        awards={awards}
        addAward={addAward}
        removeAward={removeAward}
        updateAward={updateAward}
        handleAwardFileUpload={handleAwardFileUpload}
        clearAwardFile={clearAwardFile}
        pendingAwardFileNames={pendingAwardFileNames}
        isSaving={isSaving}
        onDraftChange={(next) => setField("awards", next as any)}
      />

      {/* Cancel & Save Button */}
      {canEdit && (
        <div className="flex flex-row items-center justify-end gap-2 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full text-sm sm:text-base"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            className="w-full text-sm sm:text-base"
            onClick={async () => {
              try {
                const saved = await saveAwards(authorId!);
                if (saved) {
                  // update draft with the saved, normalized awards
                  setField("awards", saved as any);
                  setAwards(saved);
                }
                setIsEditing(false);
              } catch (err) {
                // saveProfile handles toasts
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
