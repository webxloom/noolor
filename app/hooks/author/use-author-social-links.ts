"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Contexts / Hooks
import { useToast } from "../../contexts/toast-context";

// Types / Queries
import type { SocialLinksForm } from "@/lib/types/authors";
import { updateAuthorQuery } from "@/lib/db/authors/authors-queries";
import { updatePublicationQuery } from "@/lib/db/publications/publications-queries";

export function emptySocialLinks(): SocialLinksForm {
  return {
    facebook: "",
    instagram: "",
    otherLinks: "",
    twitter: "",
    website: "",
    youtube: "",
  };
}

function toList(value: string) {
  return value
    .split(/[\n,]/)
    .map((i) => i.trim())
    .filter(Boolean);
}

export function mapSocialLinksToForm(
  socialLinks?: any | null,
): SocialLinksForm {
  return {
    facebook: socialLinks?.facebook ?? "",
    instagram: socialLinks?.instagram ?? "",
    otherLinks: Array.isArray(socialLinks?.other_links)
      ? socialLinks.other_links.join("\n")
      : "",
    twitter: socialLinks?.twitter ?? "",
    website: socialLinks?.website ?? "",
    youtube: socialLinks?.youtube ?? "",
  };
}

export function useAuthorSocialLinks(
  initial?: SocialLinksForm,
  isPublication: boolean = false,
) {
  const { addToast } = useToast();
  const [socialLinks, setSocialLinks] = useState<SocialLinksForm>(
    initial ?? emptySocialLinks(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If `initial` changes (e.g., when the parent form hydrates), update local state
    let mounted = true;
    async function seed() {
      setIsLoading(true);
      try {
        if (initial) {
          if (mounted) setSocialLinks(initial);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void seed();

    return () => {
      mounted = false;
    };
  }, [initial]);

  function setSocialField<K extends keyof SocialLinksForm>(
    field: K,
    value: string,
  ) {
    setSocialLinks((current) => ({ ...current, [field]: value }));
  }

  async function saveSocialLinks(authorId: string) {
    const supabase = createBrowserSupabaseClient();
    setIsSaving(true);

    const payload: any = {
      facebook: socialLinks.facebook.trim() || null,
      instagram: socialLinks.instagram.trim() || null,
      other_links: toList(socialLinks.otherLinks || ""),
      twitter: socialLinks.twitter.trim() || null,
      website: socialLinks.website.trim() || null,
      youtube: socialLinks.youtube.trim() || null,
    };

    const hasAny = Object.values(payload).some((v) =>
      Array.isArray(v) ? v.length > 0 : Boolean(v),
    );

    const patch = {
      social_links: hasAny ? payload : null,
    };
    try {
      const result = isPublication
        ? await updatePublicationQuery(supabase, authorId, patch as any)
        : await updateAuthorQuery(supabase, authorId, patch as any);
      if (result.error) {
        throw result.error;
      }

      addToast("Social links updated successfully", "success");
    } catch {
      addToast("Failed to update social links", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    socialLinks,
    setSocialLinks,
    setSocialField,
    saveSocialLinks,
    isLoading,
    isSaving,
  };
}
