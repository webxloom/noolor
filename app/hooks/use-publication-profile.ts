"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Contexts / Hooks
import {
  clearDraft,
  buildPayloads,
  buildInitialPublicationForm,
  mapPublicationToForm,
} from "@/app/hooks/author-profile-utils";

// Types / Queries
import { type AuthorInsert } from "@/lib/db/authors/authors-queries";
import {
  createPublicationsQuery,
  getPublicationByUserIdQuery,
  updatePublicationQuery,
} from "@/lib/db/publications/publications-queries";
import { updateProfileQuery as _updateProfileQuery } from "@/lib/db/profiles/profile-queries";
import { PublicationFormState } from "@/lib/types/authors";
import { useToast } from "../contexts/toast-context";

export function usePublicationProfile(userId: string) {
  const { addToast } = useToast();
  const supabase = createBrowserSupabaseClient();

  type CoreForm = PublicationFormState;

  const [form, setForm] = useState<CoreForm>(() =>
    buildInitialPublicationForm(),
  );

  const [publicationId, setPublicationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthor() {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await getPublicationByUserIdQuery(
        supabase,
        userId,
      );

      if (!isMounted) return;

      if (error) {
        setLoadError(error.message);
        setIsLoading(false);
        return;
      } else {
        const mapped = data
          ? mapPublicationToForm(data)
          : buildInitialPublicationForm();
        setForm((current) => ({
          ...current,
          publication_name: mapped.publication_name,
          phone: mapped.phone,
          bio: mapped.bio,
          avatar_url: mapped.avatar_url,
          location: mapped.location,
          socialLinks: mapped.socialLinks,
          awards: mapped.awards,
          is_verified: mapped.is_verified,
          is_active: mapped.is_active,
        }));
        setPublicationId(data?.id ?? null);
      }
    }

    void loadAuthor();

    return () => {
      isMounted = false;
    };
  }, [supabase, userId]);

  function setField(field: string, value: unknown) {
    setForm((current) => ({ ...current, [field]: value }) as CoreForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveProfile();
  }

  async function saveProfile() {
    setIsSaving(true);

    try {
      const { rolePayload } = buildPayloads(userId, {
        ...form,
      } as any);

      // Fetch existing records once
      const existingAuthorRes = await getPublicationByUserIdQuery(
        supabase,
        userId,
      );

      let result;
      if (existingAuthorRes.data) {
        // Only include changed fields in the patch when updating
        const patch: any = {};
        for (const [key, value] of Object.entries(rolePayload)) {
          if (key === "profile_id") continue;
          const existingValue = (existingAuthorRes.data as any)[key];
          if (JSON.stringify(existingValue) !== JSON.stringify(value)) {
            patch[key] = value === undefined ? null : value;
          }
        }

        result =
          patch && Object.keys(patch).length > 0
            ? await updatePublicationQuery(
                supabase,
                existingAuthorRes.data.id,
                patch,
              )
            : { data: existingAuthorRes.data, error: null };
      } else {
        result =
          rolePayload && Object.keys(rolePayload).length > 0
            ? await createPublicationsQuery(
                supabase,
                rolePayload as AuthorInsert,
              )
            : {
                data: null,
                error: null,
              };
      }

      if (result.error || !result.data)
        throw result.error ?? new Error("Failed to save author profile.");

      setPublicationId(result.data.id);
      clearDraft(userId);

      const nextForm = mapPublicationToForm(result.data) as CoreForm;

      setForm((current) => {
        return {
          ...current,
          bio: nextForm.bio,
          location: nextForm.location,
          socialLinks: nextForm.socialLinks,
          publication_name: nextForm.publication_name,
          phone: nextForm.phone,
        } as CoreForm;
      });

      const toastMessage = publicationId
        ? "Publication profile updated successfully."
        : "Publication profile created successfully.";
      addToast(toastMessage, "success");
    } catch (error) {
      addToast(
        `Unable to save publication profile. Please try again.`,
        "error",
      );
      console.error("Error saving profile:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    publicationId,
    form,
    handleSubmit,
    isLoading,
    isSaving,
    loadError,
    setField,
    saveProfile,
    userId,
  };
}
