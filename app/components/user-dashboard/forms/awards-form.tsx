"use client";
import React, { useEffect } from "react";
import { Plus, Trash2, Upload } from "lucide-react";

// Components
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useAwards } from "@/app/hooks/use-awards";

type Props = {
  formAwards: any; // The form object containing awards
  setField: (field: string, value: any) => void;
  isPublication: boolean;
  roleId?: string | null; // Optional roleId prop
  setIsEditing: (isEditing: boolean) => void; // Function to set the editing state
};

export default function AwardsForm({
  formAwards,
  setField,
  isPublication,
  roleId,
  setIsEditing,
}: Props) {
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
  } = useAwards(formAwards, isPublication);

  useEffect(() => {
    // keep hook awards synced when form drafts/loads change
    setAwards(
      formAwards || [
        {
          title: "",
          year: "",
          fileUrl: "",
        },
      ],
    );
  }, [formAwards, setAwards]);

  function handleTitleChange(index: number, value: string) {
    updateAward(index, "title", value);
    setField(
      "awards",
      awards.map((a, i) => (i === index ? { ...a, title: value } : a)),
    );
  }

  function handleYearChange(index: number, value: string) {
    updateAward(index, "year", value);
    setField(
      "awards",
      awards.map((a, i) => (i === index ? { ...a, year: value } : a)),
    );
  }

  function handleFileChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const fileUrl = handleAwardFileUpload(index, e);
    if (fileUrl !== null) {
      setField(
        "awards",
        awards.map((a, i) => (i === index ? { ...a, fileUrl } : a)),
      );
    }
  }

  function handleRemove(index: number) {
    removeAward(index);
    setField(
      "awards",
      awards.filter((_, i) => i !== index),
    );
  }

  function handleClearFile(index: number) {
    clearAwardFile(index);
    setField(
      "awards",
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
          className="grid gap-4 rounded-2xl border p-4"
        >
          <div className="flex justify-end">
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
                className="text-wrap"
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
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-2 sm:gap-3 pt-2">
        <Button
          type="button"
          variant="default"
          className="text-sm sm:text-base"
          onClick={async () => {
            try {
              const saved = await saveAwards(roleId!);
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
    </div>
  );
}
