"use client";

import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import type { EventRecord } from "@/lib/db/events/events-queries";
import type { EventFormState } from "@/app/components/events/shared";
import {
  buildEmptyEventForm,
  mapEventToForm,
} from "@/app/components/events/shared";
import { useToast } from "@/app/contexts/toast-context";

export function useEventState() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("catalog");
  const [editorSection, setEditorSection] = useState("details");
  const [form, setForm] = useState<EventFormState>(buildEmptyEventForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  function setField<K extends keyof EventFormState>(
    field: K,
    value: EventFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const resetEditor = useCallback(() => {
    setEditingEventId(null);
    setForm(buildEmptyEventForm());
    setEditorSection("details");
    setCoverFile(null);
  }, []);

  const startCreate = useCallback(() => {
    resetEditor();
    setActiveTab("editor");
  }, [resetEditor]);

  const startEdit = useCallback((event: EventRecord) => {
    setEditingEventId(event.id);
    setForm(mapEventToForm(event));
    setEditorSection("details");
    setCoverFile(null);
    setActiveTab("editor");
  }, []);

  function handleCoverFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast(
        "Invalid file type. Please choose an image file for the event cover.",
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

  return {
    activeTab,
    editorSection,
    form,
    coverFile,
    editingEventId,
    setField,
    setActiveTab,
    setEditorSection,
    setEditingEventId,
    resetEditor,
    startCreate,
    startEdit,
    handleCoverFileChange,
    clearCoverFile,
  };
}
