import { useMemo } from "react";
import { SocialLinksForm } from "@/lib/types/authors";
import { Bird, ExternalLink, Globe } from "lucide-react";

export default function SocialLinks({
  socialLinks,
}: {
  socialLinks: SocialLinksForm | undefined;
}) {
  const links = useMemo(() => {
    return socialLinks
      ? [
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
        ].filter((item) => item.href)
      : [];
  }, [socialLinks]);

  return (
    <div className="space-y-6">
      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No social links have been added yet.
        </p>
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
    </div>
  );
}
