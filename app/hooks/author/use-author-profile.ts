"use client";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Contexts / Hooks
import { useToast } from "../../contexts/toast-context";
import {
  buildInitialForm,
  mapAuthorToForm,
  clearDraft,
  buildPayloads,
  splitListValue,
  buildInitialPublicationForm,
  mapPublicationToForm,
} from "@/app/hooks/author-profile-utils";

// Types / Queries
import {
  createAuthorQuery,
  getAuthorByUserIdQuery,
  updateAuthorQuery,
  type AuthorInsert,
} from "@/lib/db/authors/authors-queries";
import {
  createPublicationsQuery,
  getPublicationByUserIdQuery,
  updatePublicationQuery,
} from "@/lib/db/publications/publications-queries";
import {
  getProfileByIdQuery,
  updateProfileQuery as _updateProfileQuery,
} from "@/lib/db/profiles/profile-queries";
import {
  AuthorFormState,
  ProfileFormState,
  PublicationFormState,
} from "@/lib/types/authors";
import { DashboardUser } from "../use-profile-session";

export function useAuthorProfile(user: DashboardUser) {
  const { addToast } = useToast();
  const supabase = createBrowserSupabaseClient();

  const isPublication = useMemo(() => {
    return user.role === "publication";
  }, [user]);

  type AuthorProfileForm = ProfileFormState & AuthorFormState;
  type PublicationProfileForm = ProfileFormState & PublicationFormState;
  type CoreForm = AuthorProfileForm | PublicationProfileForm;

  const [form, setForm] = useState<CoreForm>(() =>
    isPublication ? buildInitialPublicationForm(user) : buildInitialForm(user),
  );

  const [authorId, setAuthorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthor() {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = isPublication
        ? await getPublicationByUserIdQuery(supabase, user.id)
        : await getAuthorByUserIdQuery(supabase, user.id);

      if (!isMounted) return;

      if (error) {
        setLoadError(error.message);
        setIsLoading(false);
        return;
      } else {
        if (isPublication) {
          const mapped = data
            ? mapPublicationToForm(data, user)
            : buildInitialPublicationForm(user);
          setForm((current) => ({
            ...current,
            name: mapped.name,
            phone: mapped.phone,
            username: mapped.username,
            contact_email: mapped.contact_email,
            subscription_plan: mapped.subscription_plan,
            bio: mapped.bio,
            location: mapped.location,
            socialLinks: mapped.socialLinks,
            awards: mapped.awards,
          }));
        } else {
          const mapped = data
            ? mapAuthorToForm(data, user)
            : buildInitialForm(user);
          setForm((current) => ({
            ...current,
            name: mapped.name,
            phone: mapped.phone,
            username: mapped.username,
            contact_email: mapped.contact_email,
            subscription_plan: mapped.subscription_plan,
            pen_name: mapped.pen_name,
            bio: mapped.bio,
            genres: mapped.genres,
            languages: mapped.languages,
            location: mapped.location,
            socialLinks: mapped.socialLinks,
            awards: mapped.awards,
          }));
        }
        setAuthorId(data?.id ?? null);
      }
    }

    void loadAuthor();

    return () => {
      isMounted = false;
    };
  }, [supabase, user]);

  function setField(field: string, value: unknown) {
    setForm((current) => ({ ...current, [field]: value }) as CoreForm);
  }

  function toggleListField(
    field: "genres" | "languages",
    value: string,
    checked: boolean,
  ) {
    if (isPublication) {
      return;
    }

    const currentValues = splitListValue((form as AuthorProfileForm)[field]);
    const nextValues = checked
      ? [...new Set([...currentValues, value])]
      : currentValues.filter((item) => item !== value);

    setForm((current) => ({
      ...(current as AuthorProfileForm),
      [field]: nextValues.join(", "),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveProfile();
  }

  async function saveProfile() {
    setIsSaving(true);
    const isPublication = user.role === "publication";

    try {
      const { authorPayload, profilePatch } = buildPayloads(user.id, {
        ...form,
      } as any);

      // Fetch existing records once
      const existingAuthorRes = isPublication
        ? await getPublicationByUserIdQuery(supabase, user.id)
        : await getAuthorByUserIdQuery(supabase, user.id);
      const existingProfileRes = await getProfileByIdQuery(supabase, user.id);

      let result;
      if (existingAuthorRes.data) {
        // Only include changed fields in the patch when updating
        const patch: any = {};
        for (const [key, value] of Object.entries(authorPayload)) {
          if (key === "profile_id") continue;
          const existingValue = (existingAuthorRes.data as any)[key];
          if (JSON.stringify(existingValue) !== JSON.stringify(value)) {
            patch[key] = value === undefined ? null : value;
          }
        }

        result =
          patch && Object.keys(patch).length > 0
            ? isPublication
              ? await updatePublicationQuery(
                  supabase,
                  existingAuthorRes.data.id,
                  patch,
                )
              : await updateAuthorQuery(
                  supabase,
                  existingAuthorRes.data.id,
                  patch,
                )
            : { data: existingAuthorRes.data, error: null };
      } else {
        result =
          authorPayload && Object.keys(authorPayload).length > 0
            ? isPublication
              ? await createPublicationsQuery(
                  supabase,
                  authorPayload as AuthorInsert,
                )
              : await createAuthorQuery(supabase, authorPayload as AuthorInsert)
            : {
                data: null,
                error: null,
              };
      }

      if (result.error || !result.data)
        throw result.error ?? new Error("Failed to save author profile.");

      // Update profile only with changed fields
      const profilePatchOnly: any = {};
      for (const [key, value] of Object.entries(profilePatch)) {
        if (key === "id") continue;
        const existingValue = (existingProfileRes.data as any)[key];
        if (JSON.stringify(existingValue) !== JSON.stringify(value)) {
          profilePatchOnly[key] = value === undefined ? null : value;
        }
      }

      let updatedProfile = existingProfileRes.data ?? user;
      if (Object.keys(profilePatchOnly).length > 0) {
        const profileResult = await _updateProfileQuery(
          supabase,
          user.id,
          profilePatchOnly,
        );
        if (profileResult.error) throw profileResult.error;
        updatedProfile = profileResult.data ?? updatedProfile;
      }

      setAuthorId(result.data.id);
      clearDraft(user.id);

      const nextForm = isPublication
        ? (mapPublicationToForm(
            result.data,
            updatedProfile,
          ) as PublicationProfileForm)
        : (mapAuthorToForm(result.data, updatedProfile) as AuthorProfileForm);

      setForm((current) => {
        if (isPublication) {
          return {
            ...current,
            bio: nextForm.bio,
            location: nextForm.location,
            socialLinks: nextForm.socialLinks,
            name: nextForm.name,
            phone: nextForm.phone,
            username: nextForm.username,
            contact_email: nextForm.contact_email,
            subscription_plan: nextForm.subscription_plan,
          } as CoreForm;
        }

        const authorNextForm = nextForm as AuthorProfileForm;

        return {
          ...current,
          bio: authorNextForm.bio,
          location: authorNextForm.location,
          socialLinks: authorNextForm.socialLinks,
          name: authorNextForm.name,
          phone: authorNextForm.phone,
          username: authorNextForm.username,
          contact_email: authorNextForm.contact_email,
          subscription_plan: authorNextForm.subscription_plan,
          pen_name: authorNextForm.pen_name,
          genres: authorNextForm.genres,
          languages: authorNextForm.languages,
        } as CoreForm;
      });

      const toastMessage = authorId
        ? `${isPublication ? "Publication" : "Author"} profile updated successfully.`
        : `${isPublication ? "Publication" : "Author"} profile created successfully.`;
      addToast(toastMessage, "success");
    } catch (error) {
      addToast(
        `Unable to save ${isPublication ? "Publication" : "Author"} profile. Please try again.`,
        "error",
      );
      console.error("Error saving profile:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    authorId,
    form,
    handleSubmit,
    isLoading,
    isSaving,
    loadError,
    setField,
    toggleGenre: (genre: string, checked: boolean) =>
      toggleListField("genres", genre, checked),
    toggleLanguage: (language: string, checked: boolean) =>
      toggleListField("languages", language, checked),
    saveProfile,
    user,
  };
}
