"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  createBlogQuery,
  updateBlogQuery,
  deleteBlogQuery,
  type BlogRecord,
} from "@/lib/db/blogs/blogs-queries";
import type { BlogFormState } from "@/lib/types/blogs";
import {
  buildBlogPayload,
  mapBlogToForm,
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

    if (markerIndex === -1) return null;

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
  if (!storagePath) return;
  const { error } = await supabase.storage
    .from(authorImageBucket)
    .remove([storagePath]);
  if (error) throw error;
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

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(authorImageBucket)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

export function useBlogSubmit(options: {
  hostId: string | null;
  blogs: BlogRecord[];
  setBlogs: Dispatch<SetStateAction<BlogRecord[]>>;
  editingBlogId: string | null;
  form: BlogFormState;
  coverFile: File | null;
  tagInput: string;
  resetEditor: () => void;
}) {
  const { addToast } = useToast();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const {
    hostId,
    blogs,
    setBlogs,
    editingBlogId,
    form,
    coverFile,
    tagInput,
    resetEditor,
  } = options;

  async function saveBlog(isPublished: boolean) {
    if (!hostId) {
      addToast("Host profile required", "error");
      return;
    }

    setIsSaving(true);
    let uploadedCoverUrl: string | null = null;

    try {
      const pendingTag = tagInput.trim();
      const existingBlog = editingBlogId
        ? (blogs.find((b) => b.id === editingBlogId) ?? null)
        : null;
      const previousCoverUrl = existingBlog?.cover_url ?? null;

      let nextForm: BlogFormState = {
        ...form,
        tags: pendingTag ? [...new Set([...form.tags, pendingTag])] : form.tags,
        isPublished,
      };

      if (coverFile) {
        uploadedCoverUrl = await uploadBlogCover(
          supabase,
          hostId ?? "",
          coverFile,
          `cover-${slugifyBlogTitle(form.title) || "blog"}`,
        );

        nextForm = { ...nextForm, coverUrl: uploadedCoverUrl };
      }

      const payload = buildBlogPayload(hostId, nextForm);

      let result: any;

      if (editingBlogId) {
        const originalBlog = blogs.find((b) => b.id === editingBlogId);

        if (originalBlog) {
          const originalPayload = buildBlogPayload(
            hostId,
            mapBlogToForm(originalBlog),
          );

          const patch: Record<string, any> = {};
          for (const key of Object.keys(payload)) {
            const newVal = (payload as any)[key];
            const oldVal = (originalPayload as any)[key];
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal))
              patch[key] = newVal;
          }

          delete patch.author_id;

          if (Object.keys(patch).length === 0) {
            addToast("No changes detected", "info");
            resetEditor();
            return;
          }

          result = await updateBlogQuery(supabase, editingBlogId, patch);
        } else {
          result = await updateBlogQuery(supabase, editingBlogId, payload);
        }
      } else {
        result = await createBlogQuery(supabase, payload);
      }

      if (result.error) throw result.error ?? new Error("Failed to save blog.");

      const shouldDeletePreviousCover =
        Boolean(previousCoverUrl) &&
        previousCoverUrl !== nextForm.coverUrl &&
        (!nextForm.coverUrl || nextForm.coverUrl.startsWith("http"));

      if (shouldDeletePreviousCover && previousCoverUrl) {
        try {
          await deleteBlogCoverObject(supabase, previousCoverUrl);
        } catch {
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
    } catch (error) {
      addToast("Unable to save blog. Please try again.", "error");

      if (uploadedCoverUrl) {
        try {
          await deleteBlogCoverObject(supabase, uploadedCoverUrl);
        } catch {
          // ignore
        }
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(event: Event | { preventDefault?: () => void }) {
    if (event && typeof (event as any).preventDefault === "function")
      (event as any).preventDefault();
    await saveBlog(true);
  }

  async function submitAs(isPublished: boolean) {
    await saveBlog(isPublished);
  }

  async function handleDelete(blog: BlogRecord) {
    setIsDeletingId(blog.id);
    try {
      // attempt to remove stored cover file (best-effort)
      try {
        const coverUrl = (blog as any).cover_url ?? null;
        if (coverUrl) await deleteBlogCoverObject(supabase, coverUrl);
      } catch (storageErr) {
        addToast("Failed to remove stored cover image", "info");
      }

      const { error } = await deleteBlogQuery(supabase, blog.id);
      if (error) throw error;
      setBlogs((current) => current.filter((item) => item.id !== blog.id));
      if (editingBlogId === blog.id) resetEditor();
      addToast("Blog deleted successfully", "success");
    } catch (err) {
      addToast("Unable to delete blog. Please try again.", "error");
    } finally {
      setIsDeletingId(null);
    }
  }

  return {
    saveBlog,
    handleSubmit,
    submitAs,
    handleDelete,
    isSaving,
    isDeletingId,
  };
}
