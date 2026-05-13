"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { useToast } from "@/app/hooks/use-toast";
import {
  createAuthorQuery,
  getAuthorByUserIdQuery,
  updateAuthorQuery,
  type AuthorInsert,
} from "@/lib/db/authors/authors-queries";
import { updateProfileQuery } from "@/lib/db/profiles/profile-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  AwardFormItem,
  UpcomingWorkFormItem,
  SocialLinksForm,
  AuthorProfileUser,
  AuthorFormState,
  AuthorRecord,
  AuthorSocialLinks,
} from "@/lib/types/authors";

const authorImageBucket = process.env.SUPABASE_BUCKET_NAME ?? "noolor";
const authorImageFolder = "author-images";

type AuthorProfileDraft = {
  form: AuthorFormState;
};

const emptyAward = (): AwardFormItem => ({
  fileUrl: "",
  title: "",
  year: "",
});

const emptyUpcomingWork = (): UpcomingWorkFormItem => ({
  description: "",
  quote: "",
  title: "",
});

const emptySocialLinks = (): SocialLinksForm => ({
  facebook: "",
  instagram: "",
  otherLinks: "",
  twitter: "",
  website: "",
  youtube: "",
});

function buildInitialForm(user: AuthorProfileUser): AuthorFormState {
  return {
    avatarUrl: user.avatarUrl ?? "",
    awards: [emptyAward()],
    bio: "",
    genres: "",
    languages: user.language ?? "",
    location: "",
    name: user.name,
    socialLinks: emptySocialLinks(),
    upcomingWorks: [emptyUpcomingWork()],
  };
}

function toList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapSocialLinksToForm(
  socialLinks?: AuthorSocialLinks | null,
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

function mapAuthorToForm(
  author: AuthorRecord,
  user: AuthorProfileUser,
): AuthorFormState {
  return {
    avatarUrl: author.avatar_url ?? user.avatarUrl ?? "",
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
    languages: (author.languages ?? [user.language ?? ""])
      .filter(Boolean)
      .join(", "),
    location: author.location ?? "",
    name: author.name ?? user.name,
    socialLinks: mapSocialLinksToForm(author.social_links),
    upcomingWorks:
      author.upcoming_works && author.upcoming_works.length > 0
        ? author.upcoming_works.map((work) => ({
            description: work.description ?? "",
            quote: work.quote ?? "",
            title: work.title ?? "",
          }))
        : [emptyUpcomingWork()],
  };
}

function buildAuthorPayload(
  userId: string,
  form: AuthorFormState,
): AuthorInsert {
  const normalizedAwards = form.awards
    .map((award) => ({
      fileUrl: award.fileUrl.trim(),
      title: award.title.trim(),
      year: award.year.trim(),
    }))
    .filter((award) => award.title.length > 0);

  const normalizedWorks = form.upcomingWorks
    .map((work) => ({
      description: work.description.trim(),
      quote: work.quote.trim(),
      title: work.title.trim(),
    }))
    .filter(
      (work) =>
        work.title.length > 0 ||
        work.description.length > 0 ||
        work.quote.length > 0,
    );

  const socialLinks: AuthorSocialLinks = {
    facebook: form.socialLinks.facebook.trim() || null,
    instagram: form.socialLinks.instagram.trim() || null,
    other_links: toList(form.socialLinks.otherLinks),
    twitter: form.socialLinks.twitter.trim() || null,
    website: form.socialLinks.website.trim() || null,
    youtube: form.socialLinks.youtube.trim() || null,
  };

  const hasSocialLinks = Object.values(socialLinks).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );

  return {
    avatar_url: form.avatarUrl.trim() || null,
    awards:
      normalizedAwards.length > 0
        ? normalizedAwards.map((award) => ({
            title: award.title,
            year: award.year ? Number(award.year) : null,
            fileUrl: award.fileUrl || null,
          }))
        : null,
    bio: form.bio.trim() || null,
    genres: toList(form.genres),
    languages: toList(form.languages),
    location: form.location.trim() || null,
    name: form.name.trim(),
    social_links: hasSocialLinks ? socialLinks : null,
    upcoming_works:
      normalizedWorks.length > 0
        ? normalizedWorks.map((work) => ({
            description: work.description || null,
            quote: work.quote || null,
            title: work.title,
          }))
        : null,
    user_id: userId,
  };
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "jpg") : "jpg";
}

function getDraftStorageKey(userId: string) {
  return `author-profile-draft:${userId}`;
}

function sanitizeDraftForm(form: AuthorFormState): AuthorFormState {
  return {
    ...form,
    avatarUrl: form.avatarUrl.startsWith("blob:") ? "" : form.avatarUrl,
    awards: form.awards.map((award) => ({
      ...award,
      fileUrl: award.fileUrl.startsWith("blob:") ? "" : award.fileUrl,
    })),
  };
}

function loadDraft(userId: string): AuthorProfileDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawDraft = window.localStorage.getItem(getDraftStorageKey(userId));

  if (!rawDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as Partial<AuthorProfileDraft>;

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

function saveDraft(userId: string, draft: AuthorProfileDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getDraftStorageKey(userId),
    JSON.stringify({ form: sanitizeDraftForm(draft.form) }),
  );
}

function clearDraft(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getDraftStorageKey(userId));
}

async function uploadAuthorAsset(
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

export function useAuthorProfile(user: AuthorProfileUser) {
  const { toast } = useToast();
  const supabase = createBrowserSupabaseClient();
  const [form, setForm] = useState<AuthorFormState>(() =>
    buildInitialForm(user),
  );
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAwardFiles, setPendingAwardFiles] = useState<(File | null)[]>(
    [],
  );
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthor() {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await getAuthorByUserIdQuery(supabase, user.id);

      if (!isMounted) {
        return;
      }

      if (error) {
        setLoadError(error.message);
        setAuthorId(null);
        setPendingAvatarFile(null);
        setPendingAwardFiles([]);
        const fallbackForm = buildInitialForm(user);
        const draft = loadDraft(user.id);
        const nextForm = draft?.form ?? fallbackForm;

        setForm(nextForm);
        setPendingAwardFiles(new Array(nextForm.awards.length).fill(null));
      } else if (data) {
        setAuthorId(data.id);
        setPendingAvatarFile(null);
        const serverForm = mapAuthorToForm(data, user);
        const draft = loadDraft(user.id);
        const nextForm = draft?.form ?? serverForm;

        setPendingAwardFiles(new Array(nextForm.awards.length).fill(null));
        setForm(nextForm);
      } else {
        setAuthorId(null);
        setPendingAvatarFile(null);
        const fallbackForm = buildInitialForm(user);
        const draft = loadDraft(user.id);
        const nextForm = draft?.form ?? fallbackForm;

        setPendingAwardFiles(new Array(nextForm.awards.length).fill(null));
        setForm(nextForm);
      }

      setIsDraftHydrated(true);
      setIsLoading(false);
    }

    void loadAuthor();

    return () => {
      isMounted = false;
    };
  }, [supabase, user]);

  useEffect(() => {
    if (!isDraftHydrated || isLoading) {
      return;
    }

    saveDraft(user.id, { form });
  }, [form, isDraftHydrated, isLoading, user.id]);

  function setField<K extends keyof AuthorFormState>(
    field: K,
    value: AuthorFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setSocialField<K extends keyof SocialLinksForm>(
    field: K,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      socialLinks: { ...current.socialLinks, [field]: value },
    }));
  }

  function updateAward(
    index: number,
    field: keyof AwardFormItem,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      awards: current.awards.map((award, awardIndex) =>
        awardIndex === index ? { ...award, [field]: value } : award,
      ),
    }));
  }

  function updateUpcomingWork(
    index: number,
    field: keyof UpcomingWorkFormItem,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      upcomingWorks: current.upcomingWorks.map((work, workIndex) =>
        workIndex === index ? { ...work, [field]: value } : work,
      ),
    }));
  }

  function addAward() {
    setForm((current) => ({
      ...current,
      awards: [...current.awards, emptyAward()],
    }));
    setPendingAwardFiles((current) => [...current, null]);
  }

  function removeAward(index: number) {
    setForm((current) => ({
      ...current,
      awards:
        current.awards.length === 1
          ? [emptyAward()]
          : current.awards.filter((_, awardIndex) => awardIndex !== index),
    }));
    setPendingAwardFiles((current) =>
      current.length <= 1
        ? [null]
        : current.filter((_, fileIndex) => fileIndex !== index),
    );
  }

  function addUpcomingWork() {
    setForm((current) => ({
      ...current,
      upcomingWorks: [...current.upcomingWorks, emptyUpcomingWork()],
    }));
  }

  function removeUpcomingWork(index: number) {
    setForm((current) => ({
      ...current,
      upcomingWorks:
        current.upcomingWorks.length === 1
          ? [emptyUpcomingWork()]
          : current.upcomingWorks.filter((_, workIndex) => workIndex !== index),
    }));
  }

  function toggleListField(
    field: "genres" | "languages",
    value: string,
    checked: boolean,
  ) {
    const currentValues = toList(form[field]);
    const nextValues = checked
      ? [...new Set([...currentValues, value])]
      : currentValues.filter((item) => item !== value);

    setField(field, nextValues.join(", "));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      let avatarUrl = form.avatarUrl;
      let awards = form.awards;

      if (pendingAvatarFile) {
        setIsUploadingAvatar(true);
        avatarUrl = await uploadAuthorAsset(
          supabase,
          user.id,
          pendingAvatarFile,
          "avatar",
        );
      }

      if (pendingAwardFiles.some(Boolean)) {
        awards = await Promise.all(
          form.awards.map(async (award, index) => {
            const pendingFile = pendingAwardFiles[index];

            if (!pendingFile) {
              return award;
            }

            const fileUrl = await uploadAuthorAsset(
              supabase,
              user.id,
              pendingFile,
              `award-${index + 1}`,
            );

            return {
              ...award,
              fileUrl,
            };
          }),
        );
      }

      const payload = buildAuthorPayload(user.id, {
        ...form,
        avatarUrl,
        awards,
      });
      const profileLanguages = payload.languages ?? [];

      const profilePatch = {
        avatar_url: payload.avatar_url,
        languages: profileLanguages.length > 0 ? profileLanguages : null,
      };

      const result = authorId
        ? await updateAuthorQuery(supabase, authorId, payload)
        : await createAuthorQuery(supabase, payload);

      if (result.error || !result.data) {
        throw result.error ?? new Error("Failed to save author profile.");
      }

      const profileResult = await updateProfileQuery(
        supabase,
        user.id,
        profilePatch,
      );

      if (profileResult.error) {
        throw profileResult.error;
      }

      setAuthorId(result.data.id);
      clearDraft(user.id);
      setPendingAvatarFile(null);
      setPendingAwardFiles([]);
      setForm(mapAuthorToForm(result.data, user));

      toast({
        title: authorId ? "Author profile updated" : "Author profile created",
        description: "The author record has been saved to Supabase.",
      });
    } catch (error) {
      toast({
        title: "Unable to save author profile",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      setIsSaving(false);
    }
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please choose an image file for the profile picture.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    try {
      setPendingAvatarFile(file);
      setField("avatarUrl", URL.createObjectURL(file));
      toast({
        title: "Profile image selected",
        description: "The image will be uploaded when you submit the form.",
      });
    } catch {
      event.target.value = "";
    }
  }

  function handleAwardFileUpload(
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPendingAwardFiles((current) => {
      const nextFiles = [...current];
      nextFiles[index] = file;
      return nextFiles;
    });

    updateAward(index, "fileUrl", URL.createObjectURL(file));
    toast({
      title: "Award file selected",
      description: "The file will be uploaded when you submit the form.",
    });
    event.target.value = "";
  }

  function clearAvatar() {
    setPendingAvatarFile(null);
    setField("avatarUrl", "");
  }

  function clearAwardFile(index: number) {
    setPendingAwardFiles((current) => {
      const nextFiles = [...current];
      nextFiles[index] = null;
      return nextFiles;
    });
    updateAward(index, "fileUrl", "");
  }

  return {
    addAward,
    addUpcomingWork,
    authorId,
    clearAvatar,
    clearAwardFile,
    form,
    handleAvatarUpload,
    handleAwardFileUpload,
    handleSubmit,
    isLoading,
    isSaving,
    isUploadingAvatar,
    loadError,
    pendingAvatarFileName: pendingAvatarFile?.name ?? null,
    pendingAwardFileNames: pendingAwardFiles.map((file) => file?.name ?? null),
    removeAward,
    removeUpcomingWork,
    setField,
    setSocialField,
    toggleGenre: (genre: string, checked: boolean) =>
      toggleListField("genres", genre, checked),
    toggleLanguage: (language: string, checked: boolean) =>
      toggleListField("languages", language, checked),
    updateAward,
    updateUpcomingWork,
    user,
  };
}

export function splitListValue(value: string) {
  return toList(value);
}
