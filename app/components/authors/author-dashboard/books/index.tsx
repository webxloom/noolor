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
import { AuthorBooksProvider } from "@/app/contexts/books-context";
import { useAuthorBooks } from "@/app/hooks/use-author-books";
import AuthorExistingBooks from "./existing-books";
import BooksEditor from "./book-editor";
import type { WriterBooksTabProps } from "./shared";

export function AuthorBooksTab({ user }: WriterBooksTabProps) {
  const books = useAuthorBooks(user);

  const {
    activeTab,
    authorId,
    editingBookId,
    isLoading,
    loadError,
    setActiveTab,
  } = books;

  if (isLoading) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Books</CardTitle>
          <CardDescription>
            Loading the writer&apos;s book catalog.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading books...
        </CardContent>
      </Card>
    );
  }

  if (!authorId) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Books</CardTitle>
          <CardDescription>
            Create the writer profile first so books can be attached to an
            author record.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {loadError ?? "No author profile was found for this user."}
        </CardContent>
      </Card>
    );
  }

  return (
    <AuthorBooksProvider value={books}>
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
            <TabsTrigger value="catalog">Existing books</TabsTrigger>
            <TabsTrigger value="editor">
              {editingBookId ? "Edit book" : "Add new book"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <AuthorExistingBooks />
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <BooksEditor />
          </TabsContent>
        </Tabs>
      </div>
    </AuthorBooksProvider>
  );
}
