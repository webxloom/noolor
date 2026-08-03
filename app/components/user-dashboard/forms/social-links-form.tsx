import { useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useSocialLinks } from "@/app/hooks/use-social-links";

export default function SocialLinksForm({
  formSocialLinks,
  setField,
  roleId,
  isPublication,
  setIsEditing,
}: {
  formSocialLinks: any;
  setField: (field: string, value: any) => void;
  roleId: string | null;
  isPublication: boolean;
  setIsEditing: (isEditing: boolean) => void;
}) {
  const { socialLinks, setSocialLinks, saveSocialLinks, isSaving } =
    useSocialLinks(formSocialLinks, isPublication);

  // Keep local socialLinks in sync with form drafts/updates
  useEffect(() => {
    setSocialLinks(
      formSocialLinks || {
        website: "",
        twitter: "",
        instagram: "",
        facebook: "",
        youtube: "",
        otherLinks: "",
      },
    );
  }, [formSocialLinks, setSocialLinks]);

  return (
    <>
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
        />
      </div>

      {/*  Save Button */}
      <div className="flex justify-end gap-2 sm:gap-3 pt-2">
        <Button
          type="button"
          variant="default"
          className="text-sm sm:text-base"
          onClick={async () => {
            try {
              await saveSocialLinks(roleId!);
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
    </>
  );
}
