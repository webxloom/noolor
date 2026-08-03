"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

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
} from "@/app/components/blogs/shared";
import { useToast } from "@/app/contexts/toast-context";

const authorImageBucket = process.env.SUPABASE_BUCKET_NAME ?? "noolor";
const blogAssetFolder = "blogs-images";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "bin") : "bin";
}

export function getStoragePathFromPublicUrl(publicUrl: string) {
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

export function useAuthorBlogs(authorId: string | null) {
  const { addToast } = useToast();
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

      const blogsResult = await getBlogsByUserIdQuery(supabase, authorId ?? "");

      if (!isMounted) {
        return;
      }

      if (blogsResult.error) {
        setLoadError(blogsResult.error.message);
        setBlogs([]);
      } else {
        const data = blogsResult.data ?? [];
        setBlogs(Array.isArray(data) ? data : data ? [data] : []);
      }

      setIsLoading(false);
    }

    void loadBlogs();

    return () => {
      isMounted = false;
    };
  }, [supabase, authorId]);

  function setField<K extends keyof BlogFormState>(
    field: K,
    value: BlogFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
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

  async function saveBlog(isPublished: boolean) {
    if (!authorId) {
      addToast("Author profile required", "error");
      return;
    }

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
        isPublished,
      };

      if (coverFile) {
        uploadedCoverUrl = await uploadBlogCover(
          supabase,
          authorId ?? "",
          coverFile,
          `cover-${slugifyBlogTitle(form.title) || "blog"}`,
        );

        nextForm = {
          ...nextForm,
          coverUrl: uploadedCoverUrl,
        };
      }

      const payload = buildBlogPayload(authorId, nextForm);

      let result: any;

      if (editingBlogId) {
        const originalBlog = blogs.find((blog) => blog.id === editingBlogId);

        if (originalBlog) {
          const originalPayload = buildBlogPayload(
            authorId,
            mapBlogToForm(originalBlog),
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
          delete patch.author_id;

          if (Object.keys(patch).length === 0) {
            addToast("No changes detected", "info");
            resetEditor();
            setActiveTab("catalog");
            return;
          }

          result = await updateBlogQuery(supabase, editingBlogId, patch);
        } else {
          // Fallback to full payload if original not found
          result = await updateBlogQuery(supabase, editingBlogId, payload);
        }
      } else {
        result = await createBlogQuery(supabase, payload);
      }

      if (result.error) {
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
          addToast("Blog saved with storage warning", "success");
        }
      }

      setBlogs((current) => {
        const remaining = current.filter((item) => item.id !== result.data.id);
        return [result.data, ...remaining];
      });

      addToast(
        editingBlogId
          ? "Blog updated successfully"
          : isPublished
            ? "Blog created successfully"
            : "Blog saved as draft",
        "success",
      );

      resetEditor();
      setActiveTab("catalog");
    } catch (error) {
      addToast("Unable to save blog. Please try again.", "error");

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Default submit action: publish
    await saveBlog(true);
  }

  // Expose a helper to submit as publish or draft
  async function submitAs(isPublished: boolean) {
    await saveBlog(isPublished);
  }

  async function handleDelete(blog: BlogRecord) {
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

      addToast("Blog deleted successfully", "success");
    } catch (error) {
      addToast("Unable to delete blog. Please try again.", "error");
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
    submitAs,
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
    removeTag,
    resetEditor,
  };
}
