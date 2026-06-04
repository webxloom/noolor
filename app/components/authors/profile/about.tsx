"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Pencil } from "lucide-react";
import { splitListValue } from "@/app/hooks/author-profile-utils";
import { useAuthorProfileContext } from "@/app/contexts/profile-context";
import { LANGUAGES, GENRES } from "@/lib/constants/common";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";

export default function AboutAuthor({ canEdit }: { canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const {
    form,
    setField,
    toggleGenre,
    toggleLanguage,
    saveProfile,
    isSaving,
    user,
  } = useAuthorProfileContext();

  const isPublication = user.role === "publication";
  const authorForm = !isPublication
    ? (form as typeof form & {
        pen_name: string;
        languages: string;
        genres: string;
      })
    : null;
  const languages =
    !isPublication && authorForm ? splitListValue(authorForm.languages) : [];
  const genres =
    !isPublication && authorForm ? splitListValue(authorForm.genres) : [];

  if (!isEditing) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-2 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {form.name}
            </h1>

            {!isPublication && "pen_name" in form && form.pen_name && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-sm bg-primary/5 border-primary/20"
              >
                Pen Name: {form.pen_name}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{form.location || "Location not specified"}</span>
          </div>
        </div>

        {/* Languages & Genres */}
        {!isPublication && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Languages
              </h3>

              <div className="flex flex-wrap gap-2">
                {languages.length > 0 ? (
                  languages.map((language) => (
                    <Badge
                      key={language}
                      className="rounded-full bg-primary/10 text-primary border-0 px-3 py-1"
                    >
                      {language}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No languages specified
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Genres
              </h3>

              <div className="flex flex-wrap gap-2">
                {genres.length > 0 ? (
                  genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant="outline"
                      className="rounded-full px-3 py-1"
                    >
                      {genre}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No genres specified
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bio */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-primary"></div>

            <h2 className="font-serif text-2xl font-semibold">
              About the {isPublication ? "Publication" : "Author"}
            </h2>
          </div>

          <p
            className={`text-base leading-8 text-foreground/80 whitespace-pre-line transition-all duration-300 ${
              !expanded && "line-clamp-5"
            }`}
          >
            {form.bio ||
              "No biography has been added yet. Readers will soon discover their literary journey and inspirations here."}
          </p>

          {form.bio.length > 250 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {expanded ? (
                <>
                  Read less
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Read more
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Edit Button */}
        {canEdit && (
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-sm sm:text-base"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit About
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6 pb-4">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="author-name" className="text-sm sm:text-base">
            Name
          </Label>
          <Input
            id="author-name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Author display name"
            className="text-sm sm:text-base"
            required
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="author-username" className="text-sm sm:text-base">
            Username
          </Label>
          <Input
            id="author-username"
            value={form.username}
            // onChange={(event) => setField("username", event.target.value)}
            placeholder="Author user name"
            className="text-sm sm:text-base"
            required
            disabled
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="author-phone" className="text-sm sm:text-base">
            Phone
          </Label>
          <Input
            id="author-phone"
            value={form.phone}
            onChange={(event) => setField("phone", event.target.value)}
            placeholder="Author phone number"
            className="text-sm sm:text-base"
            required
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="author-email" className="text-sm sm:text-base">
            Email
          </Label>
          <Input
            id="author-email"
            value={form.contact_email}
            onChange={(event) => setField("contact_email", event.target.value)}
            placeholder="Author contact email"
            className="text-sm sm:text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {!isPublication && (
          <div className="space-y-2">
            <Label htmlFor="author-penname" className="text-sm sm:text-base">
              Pen Name
            </Label>
            <Input
              id="author-penname"
              value={authorForm?.pen_name ?? ""}
              onChange={(event) =>
                setField("pen_name", event.target.value as never)
              }
              placeholder="Author pen name"
              className="text-sm sm:text-base"
            />
          </div>
        )}

        {/* Location */}
        <div className={`space-y-2 ${isPublication ? "md:col-span-2" : ""}`}>
          <Label htmlFor="author-location" className="text-sm sm:text-base">
            Location
          </Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="author-location"
              className="pl-10 text-sm sm:text-base"
              value={form.location}
              onChange={(event) => setField("location", event.target.value)}
              placeholder="City, state, country"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="author-bio" className="text-sm sm:text-base">
          Bio
        </Label>
        <Textarea
          id="author-bio"
          value={form.bio}
          onChange={(event) => setField("bio", event.target.value)}
          placeholder="Write a concise author bio"
          className="text-sm sm:text-base min-h-[120px] sm:min-h-[150px]"
          rows={6}
        />
      </div>

      {!isPublication && (
        <div className="space-y-3 md:col-span-2">
          <Label className="text-sm sm:text-base">Languages</Label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {LANGUAGES.map((language) => {
              const checked =
                !isPublication && authorForm
                  ? splitListValue(authorForm.languages).includes(language)
                  : false;

              return (
                <label
                  key={language}
                  className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors hover:bg-accent rounded-md cursor-pointer"
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
      )}

      {!isPublication && (
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="author-genres" className="text-sm sm:text-base">
            Genres
          </Label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {GENRES.map((genre) => {
              const checked =
                !isPublication && authorForm
                  ? splitListValue(authorForm.genres).includes(genre)
                  : false;

              return (
                <label
                  key={genre}
                  className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors hover:bg-accent rounded-md cursor-pointer"
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
      )}

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
                await saveProfile();
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
