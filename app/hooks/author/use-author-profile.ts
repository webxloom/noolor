"use client";
import { useEffect, useState } from "react";
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
} from "@/app/hooks/author-profile-utils";

// Types / Queries
import {
  createAuthorQuery,
  getAuthorByUserIdQuery,
  updateAuthorQuery,
  type AuthorInsert,
} from "@/lib/db/authors/authors-queries";
import { updateProfileQuery as _updateProfileQuery } from "@/lib/db/profiles/profile-queries";
import { AuthorFormState } from "@/lib/types/authors";

export function useAuthorProfile(userId: string) {
  const { addToast } = useToast();
  const supabase = createBrowserSupabaseClient();

  type CoreForm = AuthorFormState;

  const [form, setForm] = useState<CoreForm>(() => buildInitialForm());

  const [authorId, setAuthorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthor() {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await getAuthorByUserIdQuery(supabase, userId);

      if (!isMounted) return;

      if (error) {
        setLoadError(error.message);
        setIsLoading(false);
        return;
      } else {
        const mapped = data ? mapAuthorToForm(data) : buildInitialForm();
        console.log("Mapped Author Data:", data);
        setForm((current) => ({
          ...current,
          avatar_url: mapped.avatar_url,
          phone: mapped.phone,
          pen_name: mapped.pen_name,
          bio: mapped.bio,
          genres: mapped.genres,
          languages: mapped.languages,
          location: mapped.location,
          socialLinks: mapped.socialLinks,
          awards: mapped.awards,
          is_verified: mapped.is_verified,
          is_active: mapped.is_active,
        }));
        setAuthorId(data?.id ?? null);
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

  function toggleListField(
    field: "genres" | "languages",
    value: string,
    checked: boolean,
  ) {
    const currentValues = splitListValue((form as CoreForm)[field]);
    const nextValues = checked
      ? [...new Set([...currentValues, value])]
      : currentValues.filter((item) => item !== value);

    setForm((current) => ({
      ...(current as CoreForm),
      [field]: nextValues.join(", "),
    }));
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
      const existingAuthorRes = await getAuthorByUserIdQuery(supabase, userId);

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
            ? await updateAuthorQuery(
                supabase,
                existingAuthorRes.data.id,
                patch,
              )
            : { data: existingAuthorRes.data, error: null };
      } else {
        result =
          rolePayload && Object.keys(rolePayload).length > 0
            ? await createAuthorQuery(supabase, rolePayload as AuthorInsert)
            : {
                data: null,
                error: null,
              };
      }

      if (result.error || !result.data)
        throw result.error ?? new Error("Failed to save author profile.");

      setAuthorId(result.data.id);
      clearDraft(userId);

      const nextForm = mapAuthorToForm(result.data) as CoreForm;

      setForm((current) => {
        const authorNextForm = nextForm as CoreForm;

        return {
          ...current,
          avatar_url: authorNextForm.avatar_url,
          phone: authorNextForm.phone,
          bio: authorNextForm.bio,
          location: authorNextForm.location,
          socialLinks: authorNextForm.socialLinks,
          pen_name: authorNextForm.pen_name,
          genres: authorNextForm.genres,
          languages: authorNextForm.languages,
        } as CoreForm;
      });

      const toastMessage = authorId
        ? "Author profile updated successfully!"
        : "Author profile created successfully!";
      addToast(toastMessage, "success");
    } catch (error) {
      addToast(`Unable to save author profile. Please try again.`, "error");
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
    userId,
  };
}
