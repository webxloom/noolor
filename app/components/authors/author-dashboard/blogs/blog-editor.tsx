import Link from "next/link";
import type { ChangeEvent } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

import { useAuthorBlogsContext } from "@/app/contexts/blogs-context";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { BLOG_LANGUAGES } from "@/lib/constants/blogs";
import DeleteBlog from "./delete-blog";

export default function BlogEditor({
  blogId,
  action,
  onClose,
}: {
  blogId?: string | null;
  action: string;
  onClose: (open: boolean) => void;
}) {
  const {
    addTag,
    clearCoverFile,
    coverFileName,
    editingBlogId,
    form,
    handleCoverFileChange,
    handleSubmit,
    isSaving,
    submitAs,
    removeTag,
    setField,
    setTagInput,
    tagInput,
  } = useAuthorBlogsContext();

  if (action === "delete") {
    return (
      <DeleteBlog
        editingBlogid={blogId ?? editingBlogId ?? undefined}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="font-serif text-2xl">
            {blogId ? "Edit blog" : "Add new blog"}
          </CardTitle>
        </div>
      </div>

      <div className="space-y-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="blog-title">Title</Label>
            <Input
              id="blog-title"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
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
            <Label htmlFor="blog-cover-file">Cover image</Label>
            <Input
              id="blog-cover-file"
              type="file"
              accept="image/*"
              disabled={isSaving}
              onChange={handleCoverFileChange}
            />
            <div className="rounded-xl border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
              {coverFileName
                ? `${coverFileName} will upload when you save this blog.`
                : form.coverUrl
                  ? "Stored cover image is attached."
                  : "No cover image selected yet."}
            </div>
            <div className="flex flex-wrap gap-2">
              {form.coverUrl ? (
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href={form.coverUrl} target="_blank" rel="noreferrer">
                    <Upload className="h-4 w-4" />
                    Open current image
                  </Link>
                </Button>
              ) : null}
              {form.coverUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearCoverFile}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="blog-excerpt">Excerpt</Label>
            <Textarea
              id="blog-excerpt"
              value={form.excerpt}
              onChange={(event) => setField("excerpt", event.target.value)}
              placeholder="Short summary for cards and previews"
              rows={4}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="blog-content">Content</Label>
            <Textarea
              id="blog-content"
              value={form.content}
              onChange={(event) => setField("content", event.target.value)}
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
              <Button type="button" variant="outline" onClick={addTag}>
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
                form.tags.map((tag: any, index: number) => (
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              disabled={isSaving || !form.title.trim()}
              onClick={() => void submitAs(true)}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingBlogId ? "Update blog" : "Publish blog"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void submitAs(false)}
            >
              Save as draft
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
