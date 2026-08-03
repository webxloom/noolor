"use client";
import React, { ChangeEvent } from "react";
import { Plus, Trash2, Upload } from "lucide-react";

// Components
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { BookFormState } from "../shared";
import { AwardFormItem } from "@/lib/types/authors";

export default function BookAwardsForm({
  form,
  setField,
  handleAwardFileChange,
  isSaving,
}: {
  form: BookFormState;
  setField: <K extends keyof BookFormState>(
    field: K,
    value: BookFormState[K],
  ) => void;
  handleAwardFileChange: (index: number, file: File | null) => void;
  isSaving: boolean;
}) {
  const awards = form.awards ?? [];

  function addAward() {
    const newAward: AwardFormItem = {
      title: "",
      year: "",
      fileUrl: "",
    };
    setField("awards", [...awards, newAward]);
  }

  function removeAward(index: number) {
    const filtered = awards.filter((_, i) => i !== index);
    setField("awards", filtered);
    handleAwardFileChange(index, null);
  }

  function updateAwardField(
    index: number,
    field: keyof AwardFormItem,
    value: string,
  ) {
    const updated = awards.map((award, i) =>
      i === index ? { ...award, [field]: value } : award,
    );
    setField("awards", updated);
  }

  function handleFileUpload(index: number, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleAwardFileChange(index, file);
      // Show file name in the UI by updating fileUrl temporarily
      updateAwardField(index, "fileUrl", file.name);
    }
  }

  function clearAwardFile(index: number) {
    handleAwardFileChange(index, null);
    updateAwardField(index, "fileUrl", "");
  }

  return (
    <div className="bg-muted/5 p-4 rounded-lg border space-y-4">
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-lg font-semibold">Book Awards</h3>
        <Button
          type="button"
          variant="outline"
          onClick={addAward}
          disabled={isSaving}
        >
          <Plus className="h-4 w-4" />
          Add award
        </Button>
      </div>

      {awards.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No awards added yet. Click "Add award" to get started.
        </p>
      )}

      {awards.map((award, index) => (
        <div
          key={`award-${index}`}
          className="grid gap-4 rounded-2xl border p-4"
        >
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAward(index)}
              disabled={isSaving}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`award-title-${index}`}>Award title</Label>
            <Input
              id={`award-title-${index}`}
              value={award.title ?? ""}
              onChange={(event) =>
                updateAwardField(index, "title", event.target.value)
              }
              placeholder="e.g., Sahitya Akademi Award"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`award-year-${index}`}>Year</Label>
            <Input
              id={`award-year-${index}`}
              type="text"
              value={award.year ?? ""}
              onChange={(event) =>
                updateAwardField(index, "year", event.target.value)
              }
              placeholder="e.g., 2023"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`award-file-${index}`}>Award certificate</Label>
            <Input
              id={`award-file-${index}`}
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => handleFileUpload(index, event)}
              disabled={isSaving}
            />
            {award.fileUrl && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground flex-1">
                  {award.fileUrl.startsWith("http")
                    ? "File uploaded"
                    : award.fileUrl}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => clearAwardFile(index)}
                  disabled={isSaving}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
