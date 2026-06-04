"use client";
import React from "react";
import { Plus, Trash2, Upload } from "lucide-react";

// Components
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type AwardItem = {
  title?: string;
  year?: string;
  fileUrl?: string;
};

type Props = {
  awards: AwardItem[];
  addAward: () => void;
  removeAward: (index: number) => void;
  updateAward: (index: number, field: keyof AwardItem, value: string) => void;
  handleAwardFileUpload: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => string | null;
  clearAwardFile: (index: number) => void;
  pendingAwardFileNames?: (string | null)[];
  isSaving?: boolean;
  onDraftChange?: (awards: AwardItem[]) => void;
};

export default function AwardsEditor({
  awards,
  addAward,
  removeAward,
  updateAward,
  handleAwardFileUpload,
  clearAwardFile,
  pendingAwardFileNames = [],
  isSaving = false,
  onDraftChange,
}: Props) {
  function handleTitleChange(index: number, value: string) {
    updateAward(index, "title", value);
    onDraftChange?.(
      awards.map((a, i) => (i === index ? { ...a, title: value } : a)),
    );
  }

  function handleYearChange(index: number, value: string) {
    updateAward(index, "year", value);
    onDraftChange?.(
      awards.map((a, i) => (i === index ? { ...a, year: value } : a)),
    );
  }

  function handleFileChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const fileUrl = handleAwardFileUpload(index, e);
    if (fileUrl !== null) {
      onDraftChange?.(
        awards.map((a, i) =>
          i === index ? { ...a, fileUrl: fileUrl ?? a.fileUrl } : a,
        ),
      );
    }
  }

  function handleRemove(index: number) {
    removeAward(index);
    onDraftChange?.(awards.filter((_, i) => i !== index));
  }

  function handleClearFile(index: number) {
    clearAwardFile(index);
    onDraftChange?.(
      awards.map((a, i) => (i === index ? { ...a, fileUrl: "" } : a)),
    );
  }

  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" onClick={addAward}>
        <Plus className="h-4 w-4" />
        Add award
      </Button>

      {awards.map((award, index) => (
        <div
          key={`award-${index}`}
          className="grid gap-4 rounded-2xl border p-4 md:grid-cols-2"
        >
          <div className="flex justify-end col-span-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor={`award-title-${index}`}>Award title</Label>
              <Input
                id={`award-title-${index}`}
                value={award.title ?? ""}
                onChange={(event) =>
                  handleTitleChange(index, event.target.value)
                }
                placeholder="Award or accolade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`award-year-${index}`}>Year</Label>
              <Input
                id={`award-year-${index}`}
                value={award.year ?? ""}
                onChange={(event) =>
                  handleYearChange(index, event.target.value)
                }
                placeholder="2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor={`award-file-${index}`}>Award file</Label>
              <Input
                id={`award-file-${index}`}
                type="file"
                onChange={(event) => handleFileChange(index, event)}
                disabled={isSaving}
              />

              {award.fileUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 px-0"
                  onClick={() => handleClearFile(index)}
                >
                  <Upload className="h-4 w-4" />
                  Clear selected file
                </Button>
              ) : null}
            </div>

            <div className="rounded-xl border bg-background px-3 py-2 text-xs text-muted-foreground">
              {pendingAwardFileNames[index]
                ? `${pendingAwardFileNames[index]} will upload on submit.`
                : award.fileUrl || "No image selected yet."}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
