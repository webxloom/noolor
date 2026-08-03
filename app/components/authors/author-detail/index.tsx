"use client";
import { useState } from "react";

import { useAuthorContext } from "@/app/contexts/author-context";
import { Pencil } from "lucide-react";
import { Button } from "../../ui/button";
import SocialLinks from "../../user-dashboard/role-social-links";
import Awards from "../../user-dashboard/role-awards";
import AwardsForm from "../../user-dashboard/forms/awards-form";
import AboutAuthor from "./about-author";
import SocialLinksForm from "../../user-dashboard/forms/social-links-form";
import AboutForm from "../author-dashboard/about-form";

export default function AuthorDetail({ canEdit }: { canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const {
    form,
    authorId,
    setField,
    toggleGenre,
    toggleLanguage,
    saveProfile,
    isSaving,
  } = useAuthorContext();

  const authorForm = form as typeof form & {
    pen_name: string;
    phone: string;
    location: string;
    bio: string;
    languages: string;
    genres: string;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-2 space-y-6">
      {/* Card 1: Basic Details */}
      <div className="rounded-2xl border bg-card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-primary"></div>
          <h2 className="font-serif text-2xl font-semibold">
            About the Author
          </h2>
        </div>

        {isEditing ? (
          <AboutForm
            form={authorForm}
            onCancel={() => setIsEditing(false)}
            toggleGenre={toggleGenre}
            toggleLanguage={toggleLanguage}
            saveProfile={saveProfile}
            isSaving={isSaving}
            setField={setField}
          />
        ) : (
          <AboutAuthor details={authorForm} />
        )}
      </div>

      {/* Second Row: Social Links & Awards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 2: Social Links */}
        <div className="rounded-2xl border bg-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-primary"></div>
            <h3 className="font-serif text-xl font-semibold">Social Links</h3>
          </div>

          {isEditing ? (
            <SocialLinksForm
              formSocialLinks={form.socialLinks}
              setField={setField}
              roleId={authorId}
              isPublication={false}
              setIsEditing={setIsEditing}
            />
          ) : (
            <SocialLinks socialLinks={form.socialLinks} />
          )}
        </div>

        {/* Card 3: Awards */}
        <div className="rounded-2xl border bg-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-primary"></div>
            <h3 className="font-serif text-xl font-semibold">
              Awards & Recognition
            </h3>
          </div>

          {isEditing ? (
            <AwardsForm
              formAwards={form.awards}
              isPublication={false}
              roleId={authorId}
              setField={setField}
              setIsEditing={setIsEditing}
            />
          ) : (
            <Awards awards={form.awards} />
          )}
        </div>
      </div>

      {/* Edit Button */}
      {canEdit && (
        <div className="pt-2 flex justify-end">
          {isEditing ? (
            <Button
              type="button"
              variant="secondary"
              className="gap-2 text-sm sm:text-base bg-primary/5 hover:bg-primary/10 text-primary border-primary/30 hover:border-primary/50"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-sm sm:text-base bg-primary/5 hover:bg-primary/10 text-primary border-primary/30 hover:border-primary/50"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit Bio
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
