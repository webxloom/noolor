"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  createEventQuery,
  updateEventQuery,
  deleteEventQuery,
  type EventRecord,
} from "@/lib/db/events/events-queries";
import type { EventFormState } from "@/app/components/events/shared";
import {
  buildEventPayload,
  mapEventToForm,
} from "@/app/components/events/shared";
import { useToast } from "@/app/contexts/toast-context";
import { getStoragePathFromPublicUrl } from "../author/use-author-blogs";

const authorImageBucket = process.env.SUPABASE_BUCKET_NAME ?? "noolor";
const eventAssetFolder = "events-images";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "bin") : "bin";
}

async function uploadCoverUrl(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  file: File,
  fileNamePrefix: string,
) {
  const extension = getFileExtension(file.name);
  const filePath = `${eventAssetFolder}/${userId}/${fileNamePrefix}-${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(authorImageBucket)
    .upload(filePath, file, { cacheControl: "3600", upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage
    .from(authorImageBucket)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

async function deleteCoverObject(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  coverUrl: string,
) {
  const storagePath = getStoragePathFromPublicUrl(coverUrl);
  if (!storagePath) return;
  const { error } = await supabase.storage
    .from(authorImageBucket)
    .remove([storagePath]);
  if (error) throw error;
}

export function useEventSubmit(options: {
  hostId: string | null;
  events: EventRecord[];
  setEvents: Dispatch<SetStateAction<EventRecord[]>>;
  editingEventId: string | null;
  form: EventFormState;
  coverFile: File | null;
  resetEditor: () => void;
}) {
  const { addToast } = useToast();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const {
    hostId,
    events,
    setEvents,
    editingEventId,
    form,
    coverFile,
    resetEditor,
  } = options;

  async function saveEvent() {
    if (!hostId) {
      addToast("Profile required", "error");
      return;
    }

    setIsSaving(true);
    let uploadedCoverUrl: string | null = null;

    try {
      let nextForm = { ...form };

      if (coverFile) {
        uploadedCoverUrl = await uploadCoverUrl(
          supabase,
          hostId ?? "",
          coverFile,
          `cover-${editingEventId ?? "new"}`,
        );
        nextForm = { ...nextForm, coverImage: uploadedCoverUrl };
      }

      const payload = buildEventPayload(hostId, nextForm);

      let result: any;

      if (editingEventId) {
        const originalEvent = events.find((e) => e.id === editingEventId);
        const previousCoverUrl = originalEvent?.cover_image ?? null;

        if (originalEvent) {
          const originalPayload = buildEventPayload(
            hostId,
            mapEventToForm(originalEvent),
          );
          const patch: Record<string, any> = {};
          for (const key of Object.keys(payload)) {
            const newVal = (payload as any)[key];
            const oldVal = (originalPayload as any)[key];
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal))
              patch[key] = newVal;
          }

          delete patch.host_id;

          if (Object.keys(patch).length === 0) {
            addToast("No changes detected", "info");
            resetEditor();
            return;
          }

          result = await updateEventQuery(supabase, editingEventId, patch);

          const shouldDeletePreviousCover =
            Boolean(previousCoverUrl) &&
            previousCoverUrl !== nextForm.coverImage &&
            (!nextForm.coverImage || nextForm.coverImage.startsWith("http"));

          if (shouldDeletePreviousCover && previousCoverUrl) {
            try {
              await deleteCoverObject(supabase, previousCoverUrl);
            } catch {
              addToast("Event saved with storage warning", "success");
            }
          }
        } else {
          result = await updateEventQuery(supabase, editingEventId, payload);
        }
      } else {
        result = await createEventQuery(supabase, payload);
      }

      if (result.error) throw result.error;

      if (!result.data) {
        // try refetch
        try {
          const savedId = editingEventId ?? (result as any)?.data?.id;
          if (!savedId)
            throw new Error("No id available to refetch saved event.");
          const { data: fresh, error: freshErr } = await supabase
            .from("events")
            .select("*")
            .eq("id", savedId)
            .maybeSingle();
          if (freshErr) throw freshErr;
          if (!fresh)
            throw new Error("Failed to retrieve saved event after update.");
          result.data = fresh;
        } catch (refetchError) {
          throw refetchError;
        }
      }

      setEvents((current) => {
        const remaining = current.filter((item) => item.id !== result.data.id);
        return [result.data, ...remaining];
      });

      addToast(editingEventId ? "Event updated" : "Event created", "success");

      resetEditor();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Unable to save event.",
        "error",
      );
      if (uploadedCoverUrl) {
        try {
          await deleteCoverObject(supabase, uploadedCoverUrl);
        } catch {
          // ignore
        }
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(event: EventRecord) {
    setIsDeletingId(event.id);
    try {
      // remove cover file if present (best-effort)
      try {
        const coverUrl = (event as any).cover_image ?? null;
        if (coverUrl) await deleteCoverObject(supabase, coverUrl);
      } catch (storageErr) {
        addToast("Failed to remove stored cover image", "info");
      }

      const { error } = await deleteEventQuery(supabase, event.id);
      if (error) throw error;

      setEvents((current) => current.filter((item) => item.id !== event.id));
      if (editingEventId === event.id) resetEditor();
      addToast("Event deleted", "success");
    } catch (err) {
      addToast("Unable to delete event", "error");
    } finally {
      setIsDeletingId(null);
    }
  }

  return { saveEvent, handleDelete, isSaving, isDeletingId };
}
