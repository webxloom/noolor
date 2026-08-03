"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { ProfileUpdate } from "@/lib/db/profiles/profile-queries";
import { updateAuthorQuery } from "@/lib/db/authors/authors-queries";
import {
  AwardFormItem,
  SocialLinksForm,
  AuthorRecord,
  AuthorSocialLinks,
  ProfileFormState,
  AuthorFormState,
  PublicationFormState,
  PublicationRecord,
} from "@/lib/types/authors";
import {
  emptySocialLinks,
  mapSocialLinksToForm,
} from "@/app/hooks/use-social-links";

export const authorImageBucket = process.env.SUPABASE_BUCKET_NAME ?? "noolor";
export const authorImageFolder = "author-images";
export const publicationsImageFolder = "publication-images";

export const emptyAward = (): AwardFormItem => ({
  fileUrl: "",
  title: "",
  year: "",
});

export function toList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapAuthorToForm(author: AuthorRecord) {
  return {
    avatar_url: author.author_avatar_url ?? "",
    phone: author.phone_number ?? "",
    pen_name: author.pen_name ?? "",
    awards:
      author.awards && author.awards.length > 0
        ? author.awards.map((award) => ({
            fileUrl: award.fileUrl ?? "",
            title: award.title ?? "",
            year: award.year ? String(award.year) : "",
          }))
        : [emptyAward()],
    bio: author.bio ?? "",
    genres: (author.genres ?? []).join(", "),
    languages: (author.languages ?? []).join(", "),
    location: author.location ?? "",
    socialLinks: mapSocialLinksToForm(author.social_links),
    is_verified: author.is_verified,
    is_active: author.is_active,
  };
}

export function mapPublicationToForm(publication: PublicationRecord) {
  return {
    publication_name: publication.publication_name ?? "",
    phone: publication.phone_number ?? "",
    avatar_url: publication.publication_avatar_url ?? "",
    awards:
      publication.awards && publication.awards.length > 0
        ? publication.awards.map((award) => ({
            fileUrl: award.fileUrl ?? "",
            title: award.title ?? "",
            year: award.year ? String(award.year) : "",
          }))
        : [emptyAward()],
    bio: publication.bio ?? "",
    location: publication.location ?? "",
    socialLinks: mapSocialLinksToForm(publication.social_links),
    is_verified: publication.is_verified,
    is_active: publication.is_active,
  };
}

export function buildInitialForm() {
  return {
    avatar_url: "",
    phone: "",
    pen_name: "",
    awards: [emptyAward()],
    bio: "",
    genres: "",
    languages: "",
    location: "",
    socialLinks: emptySocialLinks(),
    is_verified: false,
    is_active: false,
  } as AuthorFormState;
}

export function buildInitialPublicationForm() {
  return {
    publication_name: "",
    phone: "",
    avatar_url: "",
    awards: [emptyAward()],
    bio: "",
    location: "",
    socialLinks: emptySocialLinks(),
  } as PublicationFormState;
}

export function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "jpg") : "jpg";
}

export function getDraftStorageKey(userId: string) {
  return `author-profile-draft:${userId}`;
}

export function sanitizeDraftForm(form: ProfileFormState & AuthorFormState) {
  return {
    ...form,
    awards: Array.isArray(form.awards)
      ? form.awards.map((award) => ({
          ...award,
          fileUrl: award.fileUrl.trim(),
        }))
      : form.awards,
  };
}

export function loadDraft(userId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawDraft = window.localStorage.getItem(getDraftStorageKey(userId));

  if (!rawDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as any;

    if (!parsedDraft.form) {
      return null;
    }

    return {
      form: sanitizeDraftForm(parsedDraft.form),
    };
  } catch {
    window.localStorage.removeItem(getDraftStorageKey(userId));
    return null;
  }
}

export function saveDraft(userId: string, draft: { form: any }) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getDraftStorageKey(userId),
    JSON.stringify({ form: sanitizeDraftForm(draft.form) }),
  );
}

export function clearDraft(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getDraftStorageKey(userId));
}

export function buildPayloads(
  userId: string,
  form: AuthorFormState | PublicationFormState,
) {
  const normalizedAwards = form.awards
    ? form.awards
        .map((award) => ({
          fileUrl: award.fileUrl.trim(),
          title: award.title.trim(),
          year: award.year.trim(),
        }))
        .filter((award) => award.title.length > 0)
    : [];

  const socialLinks: AuthorSocialLinks = {
    facebook: form.socialLinks?.facebook?.trim() || null,
    instagram: form.socialLinks?.instagram?.trim() || null,
    other_links: toList(form.socialLinks?.otherLinks ?? ""),
    twitter: form.socialLinks?.twitter?.trim() || null,
    website: form.socialLinks?.website?.trim() || null,
    youtube: form.socialLinks?.youtube?.trim() || null,
  };

  const hasSocialLinks = Object.values(socialLinks).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );

  const isAuthorForm =
    "pen_name" in form || "genres" in form || "languages" in form;

  const rolePayload = isAuthorForm
    ? {
        profile_id: userId,
        pen_name: form.pen_name.trim(),
        bio: form.bio.trim(),
        genres: toList(form.genres),
        languages: toList(form.languages),
        location: form.location.trim(),
        phone_number: form.phone?.trim() || null,
        awards:
          normalizedAwards.length > 0
            ? normalizedAwards.map((award) => ({
                title: award.title,
                year: award.year ? Number(award.year) : null,
                fileUrl: award.fileUrl || null,
              }))
            : null,
        social_links: hasSocialLinks ? socialLinks : null,
      }
    : {
        profile_id: userId,
        publication_name: form.publication_name.trim(),
        phone_number: form.phone?.trim() || null,
        bio: form.bio.trim(),
        location: form.location.trim(),
        awards:
          normalizedAwards.length > 0
            ? normalizedAwards.map((award) => ({
                title: award.title,
                year: award.year ? Number(award.year) : null,
                fileUrl: award.fileUrl || null,
              }))
            : null,
        social_links: hasSocialLinks ? socialLinks : null,
      };

  return { rolePayload };
}

export async function uploadAuthorAsset(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  file: File,
  fileNamePrefix: string,
) {
  const extension = getFileExtension(file.name);
  const filePath = `${authorImageFolder}/${userId}/${fileNamePrefix}-${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(authorImageBucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(authorImageBucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export function splitListValue(value: string) {
  return toList(value);
}
