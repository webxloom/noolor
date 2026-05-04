"use client";

import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { AuthorBlogsProvider } from "@/app/contexts/blogs-context";
import { useAuthorBlogs } from "@/app/hooks/use-author-blogs";
import type { AuthorBlogsTabProps } from "@/lib/types/blogs";

import AuthorExistingBlogs from "./existing-blogs";
import BlogEditor from "./blog-editor";

export function AuthorBlogsTab({ user }: AuthorBlogsTabProps) {
  const blogs = useAuthorBlogs(user);
  const { activeTab, editingBlogId, isLoading, loadError, setActiveTab } =
    blogs;

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
    <AuthorBlogsProvider value={blogs}>
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
            <AuthorExistingBlogs />
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <BlogEditor />
          </TabsContent>
        </Tabs>
      </div>
    </AuthorBlogsProvider>
  );
}
