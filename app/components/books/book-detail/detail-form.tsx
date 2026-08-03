"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import { Textarea } from "@/app/components/ui/textarea";
import { BOOK_GENRES, BOOK_LANGUAGES } from "@/lib/constants/books";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getAuthorsQuery } from "@/lib/db/authors/authors-queries";
import { getPublicationsQuery } from "@/lib/db/publications/publications-queries";

export default function DetailsForm({
  form,
  setField,
  role,
}: {
  form: any;
  setField: any;
  role: string;
}) {
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [publications, setPublications] = useState<
    { id: string; name: string }[]
  >([]);
  const [showAuthorInput, setShowAuthorInput] = useState(false);
  const [showPublicationInput, setShowPublicationInput] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    getAuthorsQuery(supabase).then((res: any) => {
      const list = (res?.data || [])
        .map((a: any) => ({ id: a.id, name: a?.pen_name }))
        .filter((x: any) => x.name);
      setAuthors(list);
    });

    getPublicationsQuery(supabase).then((res: any) => {
      const list = (res?.data || [])
        .map((p: any) => ({ id: p.id, name: p?.publication_name }))
        .filter((x: any) => x.name);
      setPublications(list);
    });
  }, []);

  return (
    <div className="bg-muted/5 p-4 rounded-lg border">
      <h3 className="mb-4 text-lg font-semibold">Book Details</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="book-title">Book title</Label>
          <Input
            id="book-title"
            value={form.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder="Enter book title"
            required
          />
        </div>

        {/* Author & Publication Names */}
        {role === "publication" && (
          <div className="space-y-2">
            <Label htmlFor="book-author">Author</Label>
            <Select
              value={form.author_id || ""}
              onValueChange={(value) => {
                if (value === "__other__") {
                  setShowAuthorInput(true);
                  setField("authorName", "");
                  setField("author_id", null);
                } else {
                  const sel = authors.find((a) => a.id === value);
                  setShowAuthorInput(false);
                  setField("authorName", sel?.name ?? "");
                  setField("author_id", sel?.id ?? null);
                }
              }}
            >
              <SelectTrigger id="book-author">
                <SelectValue placeholder={form.authorName || "Select author"} />
              </SelectTrigger>
              <SelectContent>
                {authors.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
                <SelectItem value="__other__">
                  Other (enter manually)
                </SelectItem>
              </SelectContent>
            </Select>

            {showAuthorInput ? (
              <Input
                id="book-author-input"
                value={form.authorName || ""}
                onChange={(e) => {
                  setField("authorName", e.target.value);
                  setField("author_id", null);
                }}
                placeholder="Enter author name"
              />
            ) : null}
          </div>
        )}

        {role === "author" && (
          <div className="space-y-2">
            <Label htmlFor="book-publication">Published By</Label>
            <Select
              value={form.publication_id || ""}
              onValueChange={(value) => {
                if (value === "__other__") {
                  setShowPublicationInput(true);
                  setField("publicationName", "");
                  setField("publication_id", null);
                } else {
                  const sel = publications.find((p) => p.id === value);
                  setShowPublicationInput(false);
                  setField("publicationName", sel?.name ?? "");
                  setField("publication_id", sel?.id ?? null);
                }
              }}
            >
              <SelectTrigger id="book-publication">
                <SelectValue
                  placeholder={form.publicationName || "Select publication"}
                />
              </SelectTrigger>
              <SelectContent>
                {publications.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
                <SelectItem value="__other__">
                  Other (enter manually)
                </SelectItem>
              </SelectContent>
            </Select>

            {showPublicationInput ? (
              <Input
                id="book-publication-input"
                value={form.publicationName || ""}
                onChange={(e) => {
                  setField("publicationName", e.target.value);
                  setField("publication_id", null);
                }}
                placeholder="Enter publication name"
              />
            ) : null}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="book-year">Published year</Label>
          <Input
            id="book-year"
            type="number"
            min="1800"
            max={String(new Date().getFullYear() + 5)}
            value={form.publishedYear}
            onChange={(event) => setField("publishedYear", event.target.value)}
            placeholder="2025"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-language">Language</Label>
          <Select
            value={form.language}
            onValueChange={(value) => setField("language", value)}
          >
            <SelectTrigger id="book-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOK_LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-genre">Genre</Label>
          <Select
            value={form.genre}
            onValueChange={(value) => setField("genre", value)}
          >
            <SelectTrigger id="book-genre">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOK_GENRES.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-pages">Page count</Label>
          <Input
            id="book-pages"
            type="number"
            min="1"
            value={form.pageCount}
            onChange={(event) => setField("pageCount", event.target.value)}
            placeholder="256"
          />
        </div>

        {/* Page limit for free reading */}
        <div className="space-y-2">
          <Label htmlFor="book-free-pages">Free reading limit (pages)</Label>
          <Input
            id="book-free-pages"
            type="number"
            min="0"
            value={form.freePageLimit}
            onChange={(event) => setField("freePageLimit", event.target.value)}
            placeholder="10"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="book-description">Description</Label>
          <Textarea
            id="book-description"
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder="What is this book about?"
            rows={6}
          />
        </div>

        <div className="md:col-span-2 space-y-3">
          <Label htmlFor="book-quote-input">Quote</Label>
          <div className="flex gap-2">
            <Textarea
              id="book-quote-input"
              value={form.quote}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setField("quote", event.target.value)
              }
              placeholder="Add a memorable quote from this book"
              rows={2}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-muted/15 p-4">
          <Switch
            id="book-is-free"
            checked={form.isFree}
            onChange={(event) => setField("isFree", event.target.checked)}
          />
          <Label htmlFor="book-is-free">Free ebook</Label>
        </div>

        {!form.isFree ? (
          <div className="space-y-2">
            <Label htmlFor="book-price">Price</Label>
            <Input
              id="book-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => setField("price", event.target.value)}
              placeholder="299"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
