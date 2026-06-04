"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

import { useToast } from "../../contexts/toast-context";
import {
  createEventQuery,
  deleteEventQuery,
  EventRecord,
  getEventsByProfileIdQuery,
  updateEventQuery,
} from "@/lib/db/events/events-queries";
import {
  buildEmptyEventForm,
  buildEventPayload,
  EventFormState,
  EventStatus,
  mapEventToForm,
} from "@/app/components/authors/author-dashboard/events/shared";
import { getStoragePathFromPublicUrl } from "./use-author-blogs";

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

async function deleteCoverObject(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  coverUrl: string,
) {
  const storagePath = getStoragePathFromPublicUrl(coverUrl);

  if (!storagePath) {
    return;
  }

  const { error } = await supabase.storage
    .from(authorImageBucket)
    .remove([storagePath]);

  if (error) {
    throw error;
  }
}

export function useAuthorEvents(profileId: string | null) {
  const { addToast } = useToast();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [activeTab, setActiveTab] = useState("catalog");
  const [editorSection, setEditorSection] = useState("details");
  const [filter, setFilter] = useState<EventStatus>("draft");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<EventFormState>(buildEmptyEventForm);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      setIsLoading(true);
      setLoadError(null);

      const eventsResult = await getEventsByProfileIdQuery(
        supabase,
        profileId ?? "",
      );

      if (!isMounted) {
        return;
      }

      if (eventsResult.error) {
        setLoadError(eventsResult.error.message);
        setEvents([]);
      } else {
        const data = eventsResult.data;
        setEvents(Array.isArray(data) ? data : data ? [data] : []);
      }

      setIsLoading(false);
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, [supabase, profileId]);

  function setField<K extends keyof EventFormState>(
    field: K,
    value: EventFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetEditor() {
    setEditingEventId(null);
    setForm(buildEmptyEventForm());
    setEditorSection("details");
    setCoverFile(null);
  }

  function startCreate() {
    resetEditor();
    setActiveTab("editor");
  }

  function startEdit(event: EventRecord) {
    setEditingEventId(event.id);
    setForm(mapEventToForm(event));
    setEditorSection("details");
    setCoverFile(null);
    setActiveTab("editor");
  }

  function handleCoverFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      addToast(
        "Invalid file type. Please choose an image file for the blog cover.",
        "info",
      );

      event.target.value = "";
      return;
    }

    setCoverFile(file);
    setField("coverImage", URL.createObjectURL(file));
    event.target.value = "";
  }

  function clearCoverFile() {
    setCoverFile(null);
    setField("coverImage", "");
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profileId) {
      addToast("Author profile required", "error");
      return;
    }

    setIsSaving(true);

    let uploadedCoverUrl: string | null = null;

    try {
      let nextForm = {
        ...form,
      };

      if (coverFile) {
        uploadedCoverUrl = await uploadCoverUrl(
          supabase,
          profileId ?? "",
          coverFile,
          `cover-${editingEventId ?? "new"}`,
        );

        nextForm = {
          ...nextForm,
          coverImage: uploadedCoverUrl,
        };
      }

      const payload = buildEventPayload(profileId, nextForm);

      let result: any;

      if (editingEventId) {
        const originalEvent = events.find(
          (b) => b.id === (editingEventId as string),
        );
        const previousCoverUrl = originalEvent?.cover_image ?? null;

        if (originalEvent) {
          const originalPayload = buildEventPayload(
            profileId,
            mapEventToForm(originalEvent),
          );

          const patch: Record<string, any> = {};
          for (const key of Object.keys(payload)) {
            const newVal = (payload as any)[key];
            const oldVal = (originalPayload as any)[key];

            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              patch[key] = newVal;
            }
          }

          // Don't attempt to change author_id on update
          delete patch.host_user_id;

          if (Object.keys(patch).length === 0) {
            addToast("No changes detected", "info");
            resetEditor();
            setActiveTab("catalog");
            return;
          }

          result = await updateEventQuery(supabase, editingEventId, patch);
        } else {
          // Fallback to full payload if original not found
          result = await updateEventQuery(supabase, editingEventId, payload);
        }

        const shouldDeletePreviousCover =
          Boolean(previousCoverUrl) &&
          previousCoverUrl !== nextForm.coverImage &&
          (!nextForm.coverImage || nextForm.coverImage.startsWith("http"));

        if (shouldDeletePreviousCover && previousCoverUrl) {
          try {
            await deleteCoverObject(supabase, previousCoverUrl);
          } catch (storageError) {
            addToast("Event saved with storage warning", "success");
          }
        }
      } else {
        result = await createEventQuery(supabase, payload);
      }

      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        // Supabase sometimes returns success with null data (RLS/no-return); try to refetch the row
        try {
          const savedId = editingEventId ?? (result as any)?.data?.id;
          if (!savedId)
            throw new Error("No id available to refetch saved book.");

          const { data: fresh, error: freshErr } = await supabase
            .from("events")
            .select("*")
            .eq("id", savedId)
            .maybeSingle();

          if (freshErr) {
            throw freshErr;
          }

          if (!fresh) {
            throw new Error("Failed to retrieve saved event after update.");
          }

          result.data = fresh;
        } catch (refetchError) {
          throw refetchError;
        }
      }

      setEvents((current: any) => {
        const remaining = current.filter(
          (event: any) => event.id !== result?.data?.id,
        );
        return [result.data, ...remaining];
      });

      addToast(editingEventId ? "Event updated" : "Event created", "success");

      resetEditor();
      setActiveTab("catalog");
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "An unknown error occurred.",
        "error",
      );

      if (uploadedCoverUrl) {
        try {
          await deleteCoverObject(supabase, uploadedCoverUrl);
        } catch {
          // Ignore cleanup failures for a just-uploaded file after the main save already failed.
        }
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(event: EventRecord) {
    setIsDeletingId(event.id);

    function extractStoragePath(url?: string | null) {
      if (!url) return null;
      const marker = `/${authorImageBucket}/`;
      const idx = url.indexOf(marker);
      if (idx === -1) return null;
      let path = url.substring(idx + marker.length);
      const q = path.indexOf("?");
      if (q !== -1) path = path.substring(0, q);
      return decodeURIComponent(path);
    }

    try {
      // Collect storage paths for assets attached to this book
      const pathsToRemove: string[] = [];

      const coverPath = extractStoragePath(event.cover_image ?? null);

      if (coverPath) pathsToRemove.push(coverPath);

      // De-duplicate
      const uniquePaths = Array.from(new Set(pathsToRemove));

      if (uniquePaths.length > 0) {
        try {
          const { error: removeErr } = await supabase.storage
            .from(authorImageBucket)
            .remove(uniquePaths);

          if (removeErr) {
            addToast("Failed to remove some stored files", "info");
          }
        } catch (err) {
          addToast("Failed to remove stored files", "info");
        }
      }

      const { error } = await deleteEventQuery(supabase, event.id);

      if (error) {
        throw error;
      }

      setEvents((current) => current.filter((item) => item.id !== event.id));

      if (editingEventId === event.id) {
        resetEditor();
      }

      addToast("Event deleted", "success");
    } catch (error) {
      addToast("Unable to delete event", "error");
    } finally {
      setIsDeletingId(null);
    }
  }

  const eventsList = Array.isArray(events) ? events : [];

  return {
    activeTab,
    profileId,
    events: eventsList,
    clearCoverFile,
    coverFileName: coverFile?.name ?? null,
    handleCoverFileChange,
    editingEventId,
    editorSection,
    filter,
    form,
    handleDelete,
    handleSubmit,
    isDeletingId,
    isLoading,
    isSaving,
    loadError,
    resetEditor,
    search,
    setActiveTab,
    setEditorSection,
    setField,
    setFilter,
    setSearch,
    startCreate,
    startEdit,
  };
}
