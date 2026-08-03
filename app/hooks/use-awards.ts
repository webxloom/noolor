"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Hooks
import {
  emptyAward,
  authorImageBucket,
  authorImageFolder,
  publicationsImageFolder,
} from "@/app/hooks/author-profile-utils";
import { updateAuthorQuery } from "@/lib/db/authors/authors-queries";
import { useToast } from "../contexts/toast-context";

// Types
import type { AwardFormItem } from "@/lib/types/authors";
import { updatePublicationQuery } from "@/lib/db/publications/publications-queries";

export function useAwards(
  initialAwards: AwardFormItem[] = [emptyAward()],
  isPublication: boolean = false,
) {
  const { addToast } = useToast();
  const [awards, setAwards] = useState<AwardFormItem[]>(initialAwards);
  const [pendingAwardFiles, setPendingAwardFiles] = useState<(File | null)[]>(
    new Array(initialAwards.length).fill(null),
  );
  const [isSaving, setIsSaving] = useState(false);

  function updateAward(
    index: number,
    field: keyof AwardFormItem,
    value: string,
  ) {
    setAwards((current) =>
      current.map((award, awardIndex) =>
        awardIndex === index ? { ...award, [field]: value } : award,
      ),
    );
  }

  function addAward() {
    setAwards((current) => [...current, emptyAward()]);
    setPendingAwardFiles((current) => [...current, null]);
  }

  function removeAward(index: number) {
    setAwards((current) =>
      current.length === 1
        ? [emptyAward()]
        : current.filter((_, i) => i !== index),
    );
    setPendingAwardFiles((current) =>
      current.length <= 1 ? [null] : current.filter((_, i) => i !== index),
    );
  }

  function handleAwardFileUpload(
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ): string | null {
    const file = event.target.files?.[0];

    if (!file) {
      return null;
    }

    setPendingAwardFiles((current) => {
      const next = [...current];
      next[index] = file;
      return next;
    });

    const blobUrl = URL.createObjectURL(file);
    updateAward(index, "fileUrl", blobUrl);
    event.target.value = "";
    return blobUrl;
  }

  function clearAwardFile(index: number) {
    setPendingAwardFiles((current) => {
      const next = [...current];
      next[index] = null;
      return next;
    });
    updateAward(index, "fileUrl", "");
  }

  const saveAwards = async (authorId: string) => {
    const supabase = createBrowserSupabaseClient();
    setIsSaving(true);
    try {
      // Upload pending files first
      const nextAwards = [...awards];
      for (let i = 0; i < pendingAwardFiles.length; i++) {
        const file = pendingAwardFiles[i];
        if (!file) continue;

        const extension = file.name.split(".").pop() ?? "jpg";
        const folder = isPublication
          ? publicationsImageFolder
          : authorImageFolder;
        const filePath = `${folder}/award-${Date.now()}-${i}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(authorImageBucket)
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from(authorImageBucket)
          .getPublicUrl(filePath);

        nextAwards[i] = {
          ...nextAwards[i],
          fileUrl: data.publicUrl,
        };
      }

      const normalizedAwards = nextAwards
        .map((award) => ({
          title: award.title.trim(),
          year: award.year.trim() ? Number(award.year.trim()) : null,
          fileUrl: award.fileUrl || null,
        }))
        .filter((a) => a.title.length > 0);

      const patch = {
        awards: normalizedAwards.length > 0 ? normalizedAwards : null,
      };

      const response = isPublication
        ? await updatePublicationQuery(supabase, authorId, patch as any)
        : await updateAuthorQuery(supabase, authorId, patch as any);

      if (response.error) {
        throw response.error;
      }

      addToast("Awards updated successfully", "success");

      // Return the saved awards in form shape so callers can update drafts
      const savedFormAwards = normalizedAwards.map((a) => ({
        title: a.title,
        year: a.year != null ? String(a.year) : "",
        fileUrl: a.fileUrl ?? "",
      }));

      return savedFormAwards as AwardFormItem[];
    } catch {
      addToast("Failed to update awards", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    awards,
    pendingAwardFiles,
    addAward,
    removeAward,
    updateAward,
    handleAwardFileUpload,
    clearAwardFile,
    setAwards,
    setPendingAwardFiles,
    saveAwards,
    isSaving,
    pendingAwardFileNames: pendingAwardFiles.map((f) => f?.name ?? null),
  };
}
