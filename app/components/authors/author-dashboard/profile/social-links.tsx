"use client";

import { Card, CardContent } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { useAuthorProfileContext } from "../../../../contexts/profile-context";

export default function AuthorSocialLinks() {
  const { form, setSocialField } = useAuthorProfileContext();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="grid gap-5 md:grid-cols-2 pt-4">
        <div className="space-y-2">
          <Label htmlFor="social-website">Website</Label>
          <Input
            id="social-website"
            value={form.socialLinks.website}
            onChange={(event) => setSocialField("website", event.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social-twitter">Twitter/X</Label>
          <Input
            id="social-twitter"
            value={form.socialLinks.twitter}
            onChange={(event) => setSocialField("twitter", event.target.value)}
            placeholder="https://x.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social-instagram">Instagram</Label>
          <Input
            id="social-instagram"
            value={form.socialLinks.instagram}
            onChange={(event) =>
              setSocialField("instagram", event.target.value)
            }
            placeholder="https://instagram.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social-facebook">Facebook</Label>
          <Input
            id="social-facebook"
            value={form.socialLinks.facebook}
            onChange={(event) => setSocialField("facebook", event.target.value)}
            placeholder="https://facebook.com/..."
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="social-youtube">YouTube</Label>
          <Input
            id="social-youtube"
            value={form.socialLinks.youtube}
            onChange={(event) => setSocialField("youtube", event.target.value)}
            placeholder="https://youtube.com/..."
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="social-other-links">Other links</Label>
          <Textarea
            id="social-other-links"
            value={form.socialLinks.otherLinks}
            onChange={(event) =>
              setSocialField("otherLinks", event.target.value)
            }
            rows={4}
            placeholder="One link per line"
          />
        </div>
      </CardContent>
    </Card>
  );
}
