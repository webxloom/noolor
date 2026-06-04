"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Contexts / Hooks
import { useToast } from "../../contexts/toast-context";

// Types / Queries
import {
  getProfileByIdQuery,
  updateProfileQuery as _updateProfileQuery,
} from "@/lib/db/profiles/profile-queries";
import { ProfileFormState } from "@/lib/types/authors";
import { DashboardUser } from "../use-profile-session";

export function buildInitialForm(user: any) {
  return {
    // profile fields
    name: user.name,
    phone: user.phone,
    username: user.username,
    contact_email: user.contact_email ?? "",
    subscription_plan: user.subscription_plan ?? "free",
  } as ProfileFormState;
}

export function buildPayload(userId: string, form: ProfileFormState) {
  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    username: form.username.trim(),
    contact_email: form.contact_email.trim(),
    subscription_plan: form.subscription_plan.trim(),
  };
}

export function useReaderProfile(user: DashboardUser) {
  const { addToast } = useToast();
  const supabase = createBrowserSupabaseClient();

  type CoreForm = ProfileFormState;

  const [form, setForm] = useState<CoreForm>(() => buildInitialForm(user));
  const [isSaving, setIsSaving] = useState(false);

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
      const payload = buildPayload(user.id, {
        ...form,
      } as any);

      // Fetch existing records once
      const existingProfileRes = await getProfileByIdQuery(supabase, user.id);

      // Update profile only with changed fields
      const profilePatchOnly: any = {};
      for (const [key, value] of Object.entries(payload)) {
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

      const nextForm = buildInitialForm(updatedProfile);

      setForm((current) => {
        return {
          ...current,
          ...nextForm,
        } as CoreForm;
      });

      addToast("Profile updated successfully", "success");
    } catch (error) {
      addToast(`Unable to save profile. Please try again.`, "error");
      console.error("Error saving profile:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    form,
    handleSubmit,
    isSaving,
    setField,
    saveProfile,
    user,
  };
}
