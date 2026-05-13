import Link from "next/link";
import type { ChangeEvent } from "react";
import {
  CalendarDays,
  Loader2,
  Plus,
  Send,
  Trash2,
  Upload,
} from "lucide-react";

import { useAuthorBlogsContext } from "@/app/contexts/blogs-context";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/textarea";
import { BLOG_LANGUAGES } from "@/lib/constants/blogs";

export default function BlogEditor() {
  const {
    addTag,
    clearCoverFile,
    coverFileName,
    editingBlogId,
    editorSection,
    form,
    handleCoverFileChange,
    handleSubmit,
    isSaving,
    removeTag,
    resetEditor,
    setEditorSection,
    setField,
    setTagInput,
    tagInput,
    updateTitle,
  } = useAuthorBlogsContext();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="font-serif text-2xl">
            {editingBlogId ? "Edit blog" : "Post blog"}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft, schedule, and publish blog posts from a single editor.
          </p>
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
            <TabsContent value="details" className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="blog-title">Title</Label>
                <Input
                  id="blog-title"
                  value={form.title}
                  onChange={(event) => updateTitle(event.target.value)}
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
                      <Link
                        href={form.coverUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
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
            </TabsContent>

            <TabsContent value="content" className="grid gap-5 md:grid-cols-2">
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
                <Label htmlFor="blog-is-published">Mark as published</Label>
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
  );
}
