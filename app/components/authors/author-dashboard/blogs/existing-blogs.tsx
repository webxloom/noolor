import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

import { useAuthorBlogsContext } from "@/app/contexts/blogs-context";
import { Button } from "@/app/components/ui/button";
import { getBlogStatus } from "./shared";
import Link from "next/link";

export default function AuthorExistingBlogs({
  onEdit,
  canEdit,
}: {
  onEdit: (actionType: string, bookId?: string) => void;
  canEdit: boolean;
}) {
  const { blogs } = useAuthorBlogsContext();

  const ITEMS_PER_PAGE = 9;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE);

  const paginatedBlogs = blogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      {blogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No blogs added yet.{" "}
          {canEdit ? "Click the button above to add your first blog." : ""}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedBlogs.map((blog) => {
              const status = getBlogStatus(blog);
              return (
                <div
                  key={blog.id}
                  className="group relative overflow-hidden rounded-xl border shadow-sm aspect-[3/3.4] w-full"
                >
                  <Image
                    src={blog.cover_url || "/images/book-placeholder.png"}
                    alt={blog.title ?? "Blog cover"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />

                  {/* Overlay on image to navigate to blog detail page (visible on hover) */}
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="absolute inset-0 z-20 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                  >
                    <div className="rounded-md bg-black/60 px-3 py-2 text-sm font-medium text-white pointer-events-auto">
                      View blog details
                    </div>
                  </Link>

                  {/* Status Badge */}
                  {canEdit && (
                    <div className="absolute top-3 right-3 rounded-full bg-white px-3 py-1 shadow-lg ring-1 ring-black/10">
                      <span className="text-xs font-semibold text-gray-900">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  )}

                  {/* Bottom Overlay */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-2 backdrop-blur-sm">
                    <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-white">
                      {blog.title}
                    </h3>

                    {canEdit && (
                      <div className="ml-2 flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={() => onEdit("edit", blog.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:bg-white/20"
                          onClick={() => onEdit("delete", blog.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
