"use client";
import { useEffect, useState } from "react";
import { Bird, ExternalLink, Globe, Pencil } from "lucide-react";

// Contexts / Hooks
import { Button } from "@/app/components/ui/button";
import { useAuthorProfileContext } from "@/app/contexts/profile-context";
import { useAuthorSocialLinks } from "@/app/hooks/author/use-author-social-links";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export default function AuthorSocialLinks({
  canEdit,
  isPublication,
}: {
  canEdit: boolean;
  isPublication: boolean;
}) {
  const { form, authorId, setField } = useAuthorProfileContext();

  const { socialLinks, setSocialLinks, saveSocialLinks, isSaving } =
    useAuthorSocialLinks(form.socialLinks, isPublication);

  const [isEditing, setIsEditing] = useState(false);

  // Keep local socialLinks in sync with form drafts/updates
  useEffect(() => {
    setSocialLinks(
      form.socialLinks || {
        website: "",
        twitter: "",
        instagram: "",
        facebook: "",
        youtube: "",
        otherLinks: "",
      },
    );
  }, [form.socialLinks, setSocialLinks]);

  const links = [
    {
      label: "Website",
      href: socialLinks.website,
      icon: Globe,
    },
    {
      label: "Twitter / X",
      href: socialLinks.twitter,
      icon: Bird,
    },
    {
      label: "Instagram",
      href: socialLinks.instagram,
      icon: Globe,
    },
    {
      label: "Facebook",
      href: socialLinks.facebook,
      icon: Globe,
    },
    {
      label: "Youtube",
      href: socialLinks.youtube,
      icon: Globe,
    },
  ].filter((item) => item.href);

  if (!isEditing) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-2 space-y-6">
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Globe className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No social links have been added yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border p-4 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[220px] sm:max-w-md">
                      {href}
                    </p>
                  </div>
                </div>

                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        )}

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
              Edit Links
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6 pb-4">
      <div className="space-y-2">
        <Label htmlFor="social-website">Website</Label>
        <Input
          id="social-website"
          value={socialLinks.website}
          onChange={(event) => {
            const next = { ...socialLinks, website: event.target.value };
            setSocialLinks(next);
            setField("socialLinks", next as any);
          }}
          placeholder="https://..."
          disabled={!canEdit}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="social-twitter">Twitter/X</Label>
        <Input
          id="social-twitter"
          value={socialLinks.twitter}
          onChange={(event) => {
            const next = { ...socialLinks, twitter: event.target.value };
            setSocialLinks(next);
            setField("socialLinks", next as any);
          }}
          placeholder="https://x.com/..."
          disabled={!canEdit}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="social-instagram">Instagram</Label>
        <Input
          id="social-instagram"
          value={socialLinks.instagram}
          onChange={(event) => {
            const next = { ...socialLinks, instagram: event.target.value };
            setSocialLinks(next);
            setField("socialLinks", next as any);
          }}
          placeholder="https://instagram.com/..."
          disabled={!canEdit}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="social-facebook">Facebook</Label>
        <Input
          id="social-facebook"
          value={socialLinks.facebook}
          onChange={(event) => {
            const next = { ...socialLinks, facebook: event.target.value };
            setSocialLinks(next);
            setField("socialLinks", next as any);
          }}
          placeholder="https://facebook.com/..."
          disabled={!canEdit}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="social-youtube">YouTube</Label>
        <Input
          id="social-youtube"
          value={socialLinks.youtube}
          onChange={(event) => {
            const next = { ...socialLinks, youtube: event.target.value };
            setSocialLinks(next);
            setField("socialLinks", next as any);
          }}
          placeholder="https://youtube.com/..."
          disabled={!canEdit}
        />
      </div>

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
                await saveSocialLinks(authorId!);
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
