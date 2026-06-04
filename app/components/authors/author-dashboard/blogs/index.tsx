"use client";

import { Loader2, Plus } from "lucide-react";
import { AuthorBlogsProvider } from "@/app/contexts/blogs-context";

import AuthorExistingBlogs from "./existing-blogs";
import BlogEditor from "./blog-editor";
import { Button } from "@/app/components/ui/button";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import { useAuthorBlogs } from "@/app/hooks/author/use-author-blogs";

export function AuthorBlogsTab({
  canEdit,
  authorId,
}: {
  canEdit: boolean;
  authorId: any;
}) {
  const blogsDetail = useAuthorBlogs(authorId);
  const [showEditor, setShowEditor] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"create" | "edit" | "delete">(
    "create",
  );

  const {
    activeTab,
    blogs,
    editingBlogId,
    isLoading,
    loadError,
    setActiveTab,
    startCreate,
    startEdit,
  } = blogsDetail;

  const editBlogs = (action: string, blogId?: string) => {
    if (blogId) {
      const blog = blogs.find((b) => b.id === blogId);
      if (blog) {
        startEdit(blog);
      } else {
        // fallback: just set id
        setBlogToEdit(blogId);
      }
    } else {
      startCreate();
    }
    setShowEditor(true);
    setActionType(action as "create" | "edit" | "delete");
  };

  useEffect(() => {
    if (editingBlogId || activeTab === "editor") {
      setBlogToEdit(editingBlogId);
      setShowEditor(true);
    } else {
      setShowEditor(false);
      setBlogToEdit(null);
    }
  }, [editingBlogId, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading blogs...
      </div>
    );
  }

  if (!authorId) {
    return (
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        No author profile was found for this user. Update bio and try again.
      </div>
    );
  }

  return (
    <AuthorBlogsProvider value={blogsDetail}>
      <div className="px-4 sm:px-6 lg:px-8 py-2 space-y-6">
        {loadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          {/* Total blogs */}
          <h1 className="font-serif text-2xl font-semibold">
            {blogs.length} {blogs.length === 1 ? "blog" : "blogs"}
          </h1>

          {/* Add book */}
          {canEdit && (
            <Button
              type="button"
              className="shrink-0"
              onClick={() => editBlogs("create")}
            >
              <Plus className="h-4 w-4" />
              Add new blog
            </Button>
          )}
        </div>

        {/* BlogsList */}
        <AuthorExistingBlogs onEdit={editBlogs} canEdit={canEdit} />
      </div>

      {showEditor && (
        <Dialog
          open={showEditor}
          onOpenChange={setShowEditor}
          className="overflow-auto"
        >
          <DialogContent className="max-w-3xl overflow-auto">
            <BlogEditor
              blogId={blogToEdit}
              action={actionType}
              onClose={() => setShowEditor(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </AuthorBlogsProvider>
  );
}
