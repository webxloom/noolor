"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  CalendarDays,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

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
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/textarea";
import { useToast } from "@/app/hooks/use-toast";
import {
  createBlogQuery,
  deleteBlogQuery,
  getBlogsByUserIdQuery,
  updateBlogQuery,
  type BlogInsert,
  type BlogRecord,
} from "@/lib/db/blogs/blogs-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthorBlogsTabProps = {
  user: {
    id: string;
    name: string;
  };
};

type BlogStatus = "all" | "draft" | "published" | "scheduled";

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  language: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
};

const BLOG_LANGUAGES = [
  "Tamil",
  "English",
  "Malayalam",
  "Kannada",
  "Hindi",
  "Telugu",
  "Sanskrit",
];

const STATUS_FILTERS: { value: BlogStatus; label: string }[] = [
  { value: "all", label: "All blogs" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "scheduled", label: "Scheduled" },
];

function buildEmptyForm(): BlogFormState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverUrl: "",
    language: "Tamil",
    tags: [],
    isPublished: false,
    publishedAt: "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapBlogToForm(blog: BlogRecord): BlogFormState {
  return {
    title: blog.title ?? "",
    slug: blog.slug ?? "",
    excerpt: blog.excerpt ?? "",
    content: blog.content ?? "",
    coverUrl: blog.cover_url ?? "",
    language: blog.language ?? "Tamil",
    tags: Array.isArray(blog.tags) ? blog.tags : [],
    isPublished: Boolean(blog.is_published),
    publishedAt: blog.published_at
      ? new Date(blog.published_at).toISOString().slice(0, 16)
      : "",
  };
}

function buildBlogPayload(userId: string, form: BlogFormState): BlogInsert {
  const nextSlug = form.slug.trim() || slugify(form.title);
  const publishedAt = form.isPublished
    ? form.publishedAt
      ? new Date(form.publishedAt).toISOString()
      : new Date().toISOString()
    : null;

  return {
    user_id: userId,
    title: form.title.trim(),
    slug: nextSlug || null,
    excerpt: form.excerpt.trim() || null,
    content: form.content.trim(),
    cover_url: form.coverUrl.trim() || null,
    language: form.language,
    tags: form.tags.length > 0 ? form.tags : [],
    is_published: form.isPublished,
    published_at: publishedAt,
  };
}

function getBlogStatus(blog: BlogRecord): Exclude<BlogStatus, "all"> {
  if (!blog.is_published) {
    return "draft";
  }

  if (blog.published_at && new Date(blog.published_at).getTime() > Date.now()) {
    return "scheduled";
  }

  return "published";
}

function getStatusVariant(
  status: Exclude<BlogStatus, "all">,
): "default" | "secondary" | "outline" {
  if (status === "draft") return "outline";
  if (status === "scheduled") return "secondary";
  return "default";
}

function matchesSearch(blog: BlogRecord, search: string) {
  const haystack = [
    blog.title,
    blog.slug,
    blog.excerpt,
    blog.language,
    blog.tags?.join(" "),
    blog.content,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

export function AuthorBlogsTab({ user }: AuthorBlogsTabProps) {
  const { toast } = useToast();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [activeTab, setActiveTab] = useState("catalog");
  const [editorSection, setEditorSection] = useState("details");
  const [filter, setFilter] = useState<BlogStatus>("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<BlogFormState>(buildEmptyForm);
  const [tagInput, setTagInput] = useState("");
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
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

    load();

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

  function resetEditor() {
    setEditingBlogId(null);
    setForm(buildEmptyForm());
    setTagInput("");
    setEditorSection("details");
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
    setActiveTab("editor");
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = buildBlogPayload(user.id, form);
      const result = editingBlogId
        ? await updateBlogQuery(supabase, editingBlogId, payload)
        : await createBlogQuery(supabase, payload);

      if (result.error || !result.data) {
        throw result.error ?? new Error("Failed to save blog.");
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
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(blog: BlogRecord) {
    const confirmed = window.confirm(
      `Delete \"${blog.title}\" from the blogs table?`,
    );
    if (!confirmed) return;

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
    return matchesStatus && matchesSearch(blog, search);
  });

  const statusCounts = STATUS_FILTERS.reduce<Record<BlogStatus, number>>(
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

  if (isLoading) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Blogs</CardTitle>
          <CardDescription>
            Loading the writer&apos;s blog catalog.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading blogs...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {loadError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl border border-border/70 bg-card p-2">
          <TabsTrigger value="catalog">Existing blogs</TabsTrigger>
          <TabsTrigger value="editor">
            {editingBlogId ? "Edit blog" : "Post blog"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <section className="grid gap-4 lg:grid-cols-3 w-full">
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
                  {STATUS_FILTERS.map((statusFilter) => (
                    <Button
                      key={statusFilter.value}
                      type="button"
                      variant={
                        filter === statusFilter.value ? "default" : "outline"
                      }
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
                              <Badge variant={getStatusVariant(status)}>
                                {status}
                              </Badge>
                              {blog.language ? (
                                <Badge variant="secondary">
                                  {blog.language}
                                </Badge>
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
                                  ? new Date(
                                      blog.created_at,
                                    ).toLocaleDateString("en-IN")
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
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="font-serif text-2xl">
                  {editingBlogId ? "Edit blog" : "Post blog"}
                </CardTitle>
              </div>
              <Button type="button" variant="outline" onClick={resetEditor}>
                Reset form
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <Tabs
                value={editorSection}
                onValueChange={setEditorSection}
                className="space-y-4"
              >
                <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl border border-border/70 bg-muted/15 p-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="publishing">Publishing</TabsTrigger>
                </TabsList>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <TabsContent
                    value="details"
                    className="grid gap-5 md:grid-cols-2"
                  >
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="blog-title">Title</Label>
                      <Input
                        id="blog-title"
                        value={form.title}
                        onChange={(event) => {
                          const title = event.target.value;
                          setForm((current) => ({
                            ...current,
                            title,
                            slug:
                              editingBlogId || current.slug
                                ? current.slug
                                : slugify(title),
                          }));
                        }}
                        placeholder="Enter blog title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blog-language">Language</Label>
                      <Select
                        value={form.language}
                        onValueChange={(value) => setField("language", value)}
                      >
                        <SelectTrigger id="blog-language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOG_LANGUAGES.map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blog-cover-url">Cover URL</Label>
                      <Input
                        id="blog-cover-url"
                        value={form.coverUrl}
                        onChange={(event) =>
                          setField("coverUrl", event.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="blog-excerpt">Excerpt</Label>
                      <Textarea
                        id="blog-excerpt"
                        value={form.excerpt}
                        onChange={(event) =>
                          setField("excerpt", event.target.value)
                        }
                        placeholder="Short summary for cards and previews"
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="content"
                    className="grid gap-5 md:grid-cols-2"
                  >
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="blog-content">Content</Label>
                      <Textarea
                        id="blog-content"
                        value={form.content}
                        onChange={(event) =>
                          setField("content", event.target.value)
                        }
                        placeholder="Write the full blog content"
                        rows={16}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="blog-tag-input">Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          id="blog-tag-input"
                          value={tagInput}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setTagInput(event.target.value)
                          }
                          placeholder="writing, poetry, community"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addTag}
                        >
                          <Plus className="h-4 w-4" />
                          Add tag
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {form.tags.length === 0 ? (
                          <div className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
                            No tags added yet.
                          </div>
                        ) : (
                          form.tags.map((tag, index) => (
                            <Badge
                              key={`${tag}-${index}`}
                              variant="secondary"
                              className="gap-2"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="publishing"
                    className="grid gap-5 md:grid-cols-2"
                  >
                    <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4">
                      <Switch
                        id="blog-is-published"
                        checked={form.isPublished}
                        onChange={(event) =>
                          setField("isPublished", event.target.checked)
                        }
                      />
                      <Label htmlFor="blog-is-published">
                        Mark as published
                      </Label>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="blog-published-at">Publish at</Label>
                      <Input
                        id="blog-published-at"
                        type="datetime-local"
                        value={form.publishedAt}
                        onChange={(event) =>
                          setField("publishedAt", event.target.value)
                        }
                        disabled={!form.isPublished}
                      />
                    </div>

                    <Card className="border-border/70 bg-muted/15 shadow-none md:col-span-2">
                      <CardContent className="grid gap-4 p-4 md:grid-cols-3">
                        <div className="rounded-2xl border bg-background p-4">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Send className="h-4 w-4 text-primary" />
                            Publishing mode
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {form.isPublished
                              ? "Visible to readers once published"
                              : "Saved as draft"}
                          </p>
                        </div>
                        <div className="rounded-2xl border bg-background p-4">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            Schedule
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {form.publishedAt ||
                              "Publish immediately when toggled on"}
                          </p>
                        </div>
                        <div className="rounded-2xl border bg-background p-4">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Slug preview
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            /
                            {form.slug ||
                              slugify(form.title) ||
                              "new-blog-post"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="submit"
                      disabled={
                        isSaving || !form.title.trim() || !form.content.trim()
                      }
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {editingBlogId ? "Save blog" : "Create blog"}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
