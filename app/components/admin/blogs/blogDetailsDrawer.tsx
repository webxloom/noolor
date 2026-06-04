"use client";
import { useEffect } from "react";
import { AuthorBlogsProvider } from "@/app/contexts/blogs-context";
import { useAuthorBlogs } from "@/app/hooks/author/use-author-blogs";
import BlogEditor from "../../authors/author-dashboard/blogs/blog-editor";

type Props = {
  blog: any;
  open: boolean;
  onClose: () => void;
};

export default function BlogDetailsDrawer({ blog, open, onClose }: Props) {
  const authorId = blog?.author_id;
  const blogId = blog.id;
  const blogsDetail = useAuthorBlogs(authorId);

  const { startEdit } = blogsDetail;

  useEffect(() => {
    if (!open || !blog) return;

    let mounted = true;

    if (blogId) {
      startEdit(blog);
    }

    return () => {
      mounted = false;
    };
  }, [open, blog]);

  if (!open) return null;

  return (
    <div className="h-full w-full overflow-auto">
      <div className="w-full p-4 border-b flex items-center justify-between bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold">Blog Details</h2>
        <button
          onClick={onClose}
          className="text-sm text-gray-600 dark:text-gray-300"
        >
          Close
        </button>
      </div>

      <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
        <AuthorBlogsProvider value={blogsDetail}>
          <BlogEditor blogId={blog.id} action="edit" onClose={() => false} />
        </AuthorBlogsProvider>
      </div>
    </div>
  );
}
