import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

const socialLinksDetails: any = {
  website: { label: "Website", type: "text" },
  twitter: { label: "Twitter / X", type: "text" },
  instagram: { label: "Instagram", type: "text" },
  facebook: { label: "Facebook", type: "text" },
  youtube: { label: "YouTube", type: "text" },
};

export default function SocialLinks({
  social_links,
  setField,
}: {
  social_links: any;
  setField: (field: string, value: any) => void;
}) {
  return (
    <section className="mt-6 border-t bg-card">
      <h3 className="pt-2 font-semibold">Social Links</h3>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 pt-2">
        {socialLinksDetails &&
          Object.keys(socialLinksDetails).map((key) => {
            const detail = socialLinksDetails[key];
            if (!detail) return null;
            return (
              <div key={key} className="space-y-2">
                <Label
                  htmlFor={`user-social-${key}`}
                  className="text-sm sm:text-base"
                >
                  {detail.label}
                </Label>
                <Input
                  id={`user-social-${key}`}
                  type={detail.type}
                  value={social_links?.[key] ?? ""}
                  onChange={(event) => {
                    const nextSocialLinks = {
                      ...social_links,
                      [key]: event.target.value,
                    };
                    setField("social_links", nextSocialLinks);
                  }}
                  placeholder={detail.label}
                  className="text-sm sm:text-base"
                />
              </div>
            );
          })}
      </div>

      {/* Update button */}
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
      </div>
    </section>
  );
}
