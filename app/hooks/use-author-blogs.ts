"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { useToast } from "@/app/hooks/use-toast";
import {
  createBlogQuery,
  deleteBlogQuery,
  getBlogsByUserIdQuery,
  updateBlogQuery,
  type BlogRecord,
} from "@/lib/db/blogs/blogs-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { BLOG_STATUS_FILTERS } from "@/lib/constants/blogs";
import type { BlogFormState, BlogStatus } from "@/lib/types/blogs";

import {
  buildBlogPayload,
  buildEmptyBlogForm,
  getBlogStatus,
  mapBlogToForm,
  matchesBlogSearch,
  slugifyBlogTitle,
} from "@/app/components/authors/author-dashboard/blogs/shared";

const authorImageBucket = process.env.SUPABASE_BUCKET_NAME ?? "noolor";
const blogAssetFolder = "blogs-images";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "bin") : "bin";
}

function getStoragePathFromPublicUrl(publicUrl: string) {
  try {
    const { pathname } = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${authorImageBucket}/`;
    const markerIndex = pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const objectPath = decodeURIComponent(
      pathname.slice(markerIndex + marker.length),
    );

    return objectPath.startsWith(`${blogAssetFolder}/`) ? objectPath : null;
  } catch {
    return null;
  }
}

async function deleteBlogCoverObject(
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

async function uploadBlogCover(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  file: File,
  fileNamePrefix: string,
) {
  const extension = getFileExtension(file.name);
  const filePath = `${blogAssetFolder}/${userId}/${fileNamePrefix}-${Date.now()}.${extension}`;
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

export function useAuthorBlogs(user: { id: string; name: string }) {
  const { toast } = useToast();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [activeTab, setActiveTab] = useState("catalog");
  const [editorSection, setEditorSection] = useState("details");
  const [filter, setFilter] = useState<BlogStatus>("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<BlogFormState>(buildEmptyBlogForm);
  const [tagInput, setTagInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBlogs() {
      setIsLoading(true);
      setLoadError(null);

      const result = await getBlogsByUserIdQuery(supabase, user.id);

      if (!isMounted) {
        return;
      }

      if (result.error) {
        setLoadError(result.error.message);
        setBlogs([]);
      } else {
        setBlogs(result.data ?? []);
      }

      setIsLoading(false);
    }

    void loadBlogs();

    return () => {
      isMounted = false;
    };
  }, [supabase, user.id]);

  function setField<K extends keyof BlogFormState>(
    field: K,
    value: BlogFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug:
        editingBlogId || current.slug ? current.slug : slugifyBlogTitle(title),
    }));
  }

  function resetEditor() {
    setEditingBlogId(null);
    setForm(buildEmptyBlogForm());
    setTagInput("");
    setEditorSection("details");
    setCoverFile(null);
  }

  function startCreate() {
    resetEditor();
    setActiveTab("editor");
  }

  function startEdit(blog: BlogRecord) {
    setEditingBlogId(blog.id);
    setForm(mapBlogToForm(blog));
    setTagInput("");
    setEditorSection("details");
    setCoverFile(null);
    setActiveTab("editor");
  }

  function addTag() {
    const nextTag = tagInput.trim();

    if (!nextTag) {
      return;
    }

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

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please choose an image file for the blog cover.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setCoverFile(file);
    setField("coverUrl", URL.createObjectURL(file));
    toast({
      title: "Cover selected",
      description: "The cover image will upload when you save the blog.",
    });
    event.target.value = "";
  }

  function clearCoverFile() {
    setCoverFile(null);
    setField("coverUrl", "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    let uploadedCoverUrl: string | null = null;

    try {
      const pendingTag = tagInput.trim();
      const existingBlog = editingBlogId
        ? (blogs.find((blog) => blog.id === editingBlogId) ?? null)
        : null;
      const previousCoverUrl = existingBlog?.cover_url ?? null;
      let nextForm = {
        ...form,
        tags: pendingTag ? [...new Set([...form.tags, pendingTag])] : form.tags,
      };

      if (coverFile) {
        uploadedCoverUrl = await uploadBlogCover(
          supabase,
          user.id,
          coverFile,
          `cover-${slugifyBlogTitle(form.title) || "blog"}`,
        );

        nextForm = {
          ...nextForm,
          coverUrl: uploadedCoverUrl,
        };
      }

      const payload = buildBlogPayload(user.id, nextForm);
      const result = editingBlogId
        ? await updateBlogQuery(supabase, editingBlogId, payload)
        : await createBlogQuery(supabase, payload);

      if (result.error || !result.data) {
        throw result.error ?? new Error("Failed to save blog.");
      }

      const shouldDeletePreviousCover =
        Boolean(previousCoverUrl) &&
        previousCoverUrl !== nextForm.coverUrl &&
        (!nextForm.coverUrl || nextForm.coverUrl.startsWith("http"));

      if (shouldDeletePreviousCover && previousCoverUrl) {
        try {
          await deleteBlogCoverObject(supabase, previousCoverUrl);
        } catch (storageError) {
          toast({
            title: "Blog saved with storage warning",
            description:
              storageError instanceof Error
                ? storageError.message
                : "The previous cover image could not be removed from storage.",
            variant: "destructive",
          });
        }
      }

      setBlogs((current) => {
        const remaining = current.filter((item) => item.id !== result.data.id);
        return [result.data, ...remaining];
      });

      toast({
        title: editingBlogId ? "Blog updated" : "Blog created",
        description: "The blog row has been saved to Supabase.",
      });

      resetEditor();
      setActiveTab("catalog");
    } catch (error) {
      toast({
        title: "Unable to save blog",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });

      if (uploadedCoverUrl) {
        try {
          await deleteBlogCoverObject(supabase, uploadedCoverUrl);
        } catch {
          // Ignore cleanup failures for a just-uploaded file after the main save already failed.
        }
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(blog: BlogRecord) {
    const confirmed = window.confirm(
      `Delete \"${blog.title}\" from the blogs table?`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingId(blog.id);

    try {
      const { error } = await deleteBlogQuery(supabase, blog.id);

      if (error) {
        throw error;
      }

      setBlogs((current) => current.filter((item) => item.id !== blog.id));

      if (editingBlogId === blog.id) {
        resetEditor();
      }

      toast({
        title: "Blog deleted",
        description: "The blog row was removed from Supabase.",
      });
    } catch (error) {
      toast({
        title: "Unable to delete blog",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const status = getBlogStatus(blog);
    const matchesStatus = filter === "all" ? true : status === filter;
    return matchesStatus && matchesBlogSearch(blog, search);
  });

  const statusCounts = BLOG_STATUS_FILTERS.reduce<Record<BlogStatus, number>>(
    (accumulator, statusFilter) => {
      accumulator[statusFilter.value] =
        statusFilter.value === "all"
          ? blogs.length
          : blogs.filter((blog) => getBlogStatus(blog) === statusFilter.value)
              .length;
      return accumulator;
    },
    { all: 0, draft: 0, published: 0, scheduled: 0 },
  );

  return {
    activeTab,
    addTag,
    blogs,
    clearCoverFile,
    coverFileName: coverFile?.name ?? null,
    editingBlogId,
    editorSection,
    filter,
    filteredBlogs,
    form,
    handleCoverFileChange,
    handleDelete,
    handleSubmit,
    isDeletingId,
    isLoading,
    isSaving,
    loadError,
    search,
    setActiveTab,
    setEditorSection,
    setField,
    setFilter,
    setSearch,
    setTagInput,
    startCreate,
    startEdit,
    statusCounts,
    tagInput,
    updateTitle,
    user,
    removeTag,
    resetEditor,
  };
}
