"use client";

import { MapPin, Loader2, Upload } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../../../ui/avatar";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { Checkbox } from "../../../ui/checkbox";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { getInitials } from "../../summary-card";
import { GENRES, LANGUAGES } from "@/lib/constants/common";
import { useAuthorProfileContext } from "../../../../contexts/profile-context";
import { splitListValue } from "../../../../hooks/use-author-profile";

export default function AboutAuthor() {
  const {
    clearAvatar,
    form,
    handleAvatarUpload,
    isSaving,
    isUploadingAvatar,
    pendingAvatarFileName,
    setField,
    toggleGenre,
    toggleLanguage,
    user,
  } = useAuthorProfileContext();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="grid gap-5 md:grid-cols-2 pt-4">
        <div className="space-y-2">
          <Label htmlFor="author-name">Name</Label>
          <Input
            id="author-name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Author display name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author-location">Location</Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="author-location"
              className="pl-10"
              value={form.location}
              onChange={(event) => setField("location", event.target.value)}
              placeholder="City, state, country"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="author-avatar-url">Profile Pic</Label>
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Avatar className="h-20 w-20 border border-border/60 shadow-sm">
                {form.avatarUrl ? (
                  <AvatarImage src={form.avatarUrl} alt={form.name} />
                ) : null}
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {getInitials(form.name || user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <Input
                  id="author-avatar-url"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isSaving}
                />
                <div className="rounded-xl border bg-background px-3 py-2 text-xs text-muted-foreground">
                  {pendingAvatarFileName
                    ? `${pendingAvatarFileName} will upload on submit.`
                    : form.avatarUrl || "No image selected yet."}
                </div>
              </div>
            </div>

            {isUploadingAvatar ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading image to storage...
              </div>
            ) : null}

            {!isUploadingAvatar && form.avatarUrl ? (
              <Button
                type="button"
                variant="ghost"
                className="mt-3 gap-2"
                onClick={clearAvatar}
              >
                <Upload className="h-4 w-4" />
                Clear selected image
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="author-bio">Bio</Label>
          <Textarea
            id="author-bio"
            value={form.bio}
            onChange={(event) => setField("bio", event.target.value)}
            placeholder="Write a concise author bio"
            rows={6}
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label>Languages</Label>
          <div className="flex gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4">
            {LANGUAGES.map((language) => {
              const checked = splitListValue(form.languages).includes(language);

              return (
                <label
                  key={language}
                  className="flex items-center gap-3 rounded-xl border border-transparent bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:border-border"
                >
                  <Checkbox
                    checked={checked}
                    onChange={(event) =>
                      toggleLanguage(language, event.target.checked)
                    }
                  />
                  <span>{language}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="author-genres">Genres</Label>
          <div className="flex flex-wrap gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4">
            {GENRES.map((genre) => {
              const checked = splitListValue(form.genres).includes(genre);

              return (
                <label
                  key={genre}
                  className="flex items-center gap-3 rounded-xl border border-transparent bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:border-border"
                >
                  <Checkbox
                    checked={checked}
                    onChange={(event) =>
                      toggleGenre(genre, event.target.checked)
                    }
                  />
                  <span>{genre}</span>
                </label>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
