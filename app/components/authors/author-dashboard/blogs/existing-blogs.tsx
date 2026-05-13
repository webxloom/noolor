import { Filter, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { useAuthorBlogsContext } from "@/app/contexts/blogs-context";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { BLOG_STATUS_FILTERS } from "@/lib/constants/blogs";

import { getBlogStatus, getBlogStatusVariant } from "./shared";

export default function AuthorExistingBlogs() {
  const {
    blogs,
    filter,
    filteredBlogs,
    handleDelete,
    isDeletingId,
    search,
    setFilter,
    setSearch,
    startCreate,
    startEdit,
    statusCounts,
  } = useAuthorBlogsContext();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <section className="grid w-full gap-4 lg:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Total blogs</CardDescription>
              <CardTitle className="font-serif text-3xl">
                {blogs.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Published live</CardDescription>
              <CardTitle className="font-serif text-3xl">
                {statusCounts.published}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Draft or scheduled</CardDescription>
              <CardTitle className="font-serif text-3xl">
                {statusCounts.draft + statusCounts.scheduled}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>
        <Button type="button" onClick={startCreate} className="shrink-0">
          <Plus className="h-4 w-4" />
          New blog post
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, slug, tag, language, or content"
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {BLOG_STATUS_FILTERS.map((statusFilter) => (
              <Button
                key={statusFilter.value}
                type="button"
                variant={filter === statusFilter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(statusFilter.value)}
              >
                <Filter className="h-3.5 w-3.5" />
                {statusFilter.label}
                <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground">
                  {statusCounts[statusFilter.value]}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredBlogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
              No blogs matched the current filters.
            </div>
          ) : (
            filteredBlogs.map((blog) => {
              const status = getBlogStatus(blog);

              return (
                <div
                  key={blog.id}
                  className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">
                          {blog.title}
                        </h3>
                        <Badge variant={getBlogStatusVariant(status)}>
                          {status}
                        </Badge>
                        {blog.language ? (
                          <Badge variant="secondary">{blog.language}</Badge>
                        ) : null}
                        {blog.slug ? (
                          <Badge variant="outline">/{blog.slug}</Badge>
                        ) : null}
                      </div>
                      <p className="max-w-3xl text-sm text-muted-foreground">
                        {blog.excerpt || "No excerpt added yet."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(blog.tags ?? []).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                          Created:{" "}
                          {blog.created_at
                            ? new Date(blog.created_at).toLocaleDateString(
                                "en-IN",
                              )
                            : "-"}
                        </span>
                        <span>
                          Publish at:{" "}
                          {blog.published_at
                            ? new Date(blog.published_at).toLocaleString(
                                "en-IN",
                              )
                            : "Not scheduled"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(blog)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(blog)}
                        disabled={isDeletingId === blog.id}
                      >
                        {isDeletingId === blog.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
