"use client";

import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "../../../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { useAuthorProfileContext } from "../../../../contexts/profile-context";

export default function AuthorAwards() {
  const {
    addAward,
    clearAwardFile,
    form,
    handleAwardFileUpload,
    isSaving,
    pendingAwardFileNames,
    removeAward,
    updateAward,
  } = useAuthorProfileContext();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="font-serif text-2xl">Awards</CardTitle>
        </div>
        <Button type="button" variant="outline" onClick={addAward}>
          <Plus className="h-4 w-4" />
          Add award
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {form.awards.map((award, index) => (
          <div
            key={`award-${index}`}
            className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[1fr_120px_1fr_auto] md:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor={`award-title-${index}`}>Award title</Label>
              <Input
                id={`award-title-${index}`}
                value={award.title}
                onChange={(event) =>
                  updateAward(index, "title", event.target.value)
                }
                placeholder="Award or accolade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`award-year-${index}`}>Year</Label>
              <Input
                id={`award-year-${index}`}
                value={award.year}
                onChange={(event) =>
                  updateAward(index, "year", event.target.value)
                }
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`award-file-${index}`}>Award file</Label>
              <Input
                id={`award-file-${index}`}
                type="file"
                onChange={(event) => handleAwardFileUpload(index, event)}
                disabled={isSaving}
              />
              <div className="rounded-xl border bg-background px-3 py-2 text-xs text-muted-foreground">
                {pendingAwardFileNames[index]
                  ? `${pendingAwardFileNames[index]} will upload on submit.`
                  : award.fileUrl || "No image selected yet."}
              </div>
              {award.fileUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 px-0"
                  onClick={() => clearAwardFile(index)}
                >
                  <Upload className="h-4 w-4" />
                  Clear selected file
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeAward(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
