"use client";

import { useState, useCallback } from "react";
import type { ChangeEvent } from "react";
import type { BlogRecord } from "@/lib/db/blogs/blogs-queries";
import type { BlogFormState } from "@/lib/types/blogs";
import {
  buildEmptyBlogForm,
  mapBlogToForm,
} from "@/app/components/blogs/shared";
import { useToast } from "@/app/contexts/toast-context";

export function useBlogState() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("catalog");
  const [editorSection, setEditorSection] = useState("details");
  const [form, setForm] = useState<BlogFormState>(buildEmptyBlogForm);
  const [tagInput, setTagInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  function setField<K extends keyof BlogFormState>(
    field: K,
    value: BlogFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addTag() {
    const nextTag = tagInput.trim();

    if (!nextTag) return;

    setForm((current) => ({
      ...current,
      tags: [...new Set([...current.tags, nextTag])],
    }));

    setTagInput("");
  }

  function removeTag(index: number) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((_, tagIndex) => tagIndex !== index),
    }));
  }

  function handleCoverFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast(
        "Invalid file type. Please choose an image file for the blog cover.",
        "info",
      );
      event.target.value = "";
      return;
    }

    setCoverFile(file);
    setField("coverUrl", URL.createObjectURL(file));
    event.target.value = "";
  }

  function clearCoverFile() {
    setCoverFile(null);
    setField("coverUrl", "");
  }

  const resetEditor = useCallback(() => {
    setEditingBlogId(null);
    setForm(buildEmptyBlogForm());
    setCoverFile(null);
    setTagInput("");
    setEditorSection("details");
  }, []);

  const startCreate = useCallback(() => {
    resetEditor();
    setActiveTab("editor");
  }, [resetEditor]);

  const startEdit = useCallback((blog: BlogRecord) => {
    setEditingBlogId(blog.id);
    setForm(mapBlogToForm(blog));
    setActiveTab("editor");
  }, []);

  return {
    activeTab,
    editorSection,
    form,
    tagInput,
    coverFile,
    editingBlogId,
    setField,
    setActiveTab,
    setEditorSection,
    setTagInput,
    addTag,
    removeTag,
    handleCoverFileChange,
    clearCoverFile,
    resetEditor,
    startCreate,
    startEdit,
  };
}
