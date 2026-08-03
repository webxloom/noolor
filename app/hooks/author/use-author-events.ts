"use client";

import { useEventsList } from "@/app/hooks/events/use-events-list";
import { useEventState } from "@/app/hooks/events/use-event-state";
import { useEventSubmit } from "@/app/hooks/events/use-event-submit";

export function useAuthorEvents(profileId: string | null) {
  const list = useEventsList(profileId);
  const state = useEventState();
  const submit = useEventSubmit({
    profileId: profileId,
    events: list.events,
    setEvents: list.setEvents,
    editingEventId: state.editingEventId,
    form: state.form,
    coverFile: state.coverFile,
    resetEditor: () => {
      state.resetEditor();
      list.resetEditor();
    },
  });

  return {
    // list
    activeTab: list.activeTab,
    profileId: list.profileId,
    events: list.events,
    clearCoverFile: state.clearCoverFile,
    coverFileName: state.coverFile?.name ?? null,
    handleCoverFileChange: state.handleCoverFileChange,
    editingEventId: state.editingEventId,
    editorSection: state.editorSection,
    filter: list.filters.status,
    form: state.form,
    handleDelete: submit.handleDelete,
    handleSubmit: (e?: Event | { preventDefault?: () => void }) => {
      if (e && typeof (e as any).preventDefault === "function")
        (e as any).preventDefault();
      void submit.saveEvent();
    },
    isDeletingId: submit.isDeletingId,
    isLoading: list.isLoading,
    isSaving: submit.isSaving,
    loadError: list.loadError,
    resetEditor: () => {
      state.resetEditor();
      list.resetEditor();
    },
    search: list.filters.search,
    setActiveTab: list.setActiveTab,
    setEditorSection: state.setEditorSection,
    setField: state.setField,
    setFilter: (value: any) =>
      list.setFilters((f: any) => ({ ...f, status: value })),
    setSearch: (value: string) =>
      list.setFilters((f: any) => ({ ...f, search: value })),
    startCreate: () => {
      state.startCreate();
      list.startCreate();
    },
    startEdit: (event: any) => {
      state.startEdit(event);
      list.startEdit(event.id);
    },
  };
}
