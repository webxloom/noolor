import Link from "next/link";
import type { ChangeEvent } from "react";
import {
  BookOpen,
  CircleDollarSign,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import { useAuthorBooksContext } from "@/app/contexts/books-context";
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

import {
  BOOK_GENRES,
  BOOK_LANGUAGES,
  getAssetActionLabel,
  type BookAssetField,
} from "./shared";

function AssetField({
  accept,
  field,
  helper,
  title,
}: {
  accept?: string;
  field: BookAssetField;
  helper: string;
  title: string;
}) {
  const { assetFileNames, clearAsset, form, handleAssetFileUpload, isSaving } =
    useAuthorBooksContext();

  const value = form[field];
  const pendingName = assetFileNames[field];

  return (
    <div className="space-y-3 rounded-2xl border bg-background p-4">
      <div className="space-y-1">
        <Label htmlFor={`book-asset-${field}`}>{title}</Label>
        <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
      </div>
      <Input
        id={`book-asset-${field}`}
        type="file"
        accept={accept}
        disabled={isSaving}
        onChange={(event) => handleAssetFileUpload(field, event)}
      />
      <div className="rounded-xl border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
        {pendingName
          ? `${pendingName} will upload when you save this book.`
          : value
            ? `Stored ${getAssetActionLabel(field)} is attached.`
            : `No ${getAssetActionLabel(field)} added yet.`}
      </div>
      <div className="flex flex-wrap gap-2">
        {value ? (
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={value} target="_blank" rel="noreferrer">
              <Upload className="h-4 w-4" />
              Open current file
            </Link>
          </Button>
        ) : null}
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => clearAsset(field)}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function BooksEditor() {
  const {
    addQuote,
    editingBookId,
    editorSection,
    form,
    handleSubmit,
    isSaving,
    quoteInput,
    removeQuote,
    resetEditor,
    setEditorSection,
    setField,
    setQuoteInput,
  } = useAuthorBooksContext();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="font-serif text-2xl">
            {editingBookId ? "Edit book" : "Add new book"}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Save book metadata, upload covers, and attach the reading file in
            one place.
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
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Content</TabsTrigger>
          </TabsList>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <TabsContent value="details" className="grid gap-5 md:grid-cols-2">
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
                  onChange={(event) =>
                    setField("pageCount", event.target.value)
                  }
                  placeholder="256"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-year">Published year</Label>
                <Input
                  id="book-year"
                  type="number"
                  min="1800"
                  max={String(new Date().getFullYear() + 5)}
                  value={form.publishedYear}
                  onChange={(event) =>
                    setField("publishedYear", event.target.value)
                  }
                  placeholder="2025"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="book-description">Description</Label>
                <Textarea
                  id="book-description"
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  placeholder="What is this book about?"
                  rows={6}
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="book-quote-input">Sample quotes</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="book-quote-input"
                    value={quoteInput}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setQuoteInput(event.target.value)
                    }
                    placeholder="Add a memorable quote from this book"
                    rows={2}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="self-end"
                    onClick={addQuote}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.quotes.length === 0 ? (
                    <div className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
                      No quotes added yet.
                    </div>
                  ) : (
                    form.quotes.map((quote, index) => (
                      <div
                        key={`${quote}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-xl border bg-muted/15 px-4 py-3 text-sm"
                      >
                        <p className="italic text-muted-foreground">{quote}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuote(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="grid gap-5 md:grid-cols-2">
              <AssetField
                field="coverUrl"
                title="Front cover"
                helper="Upload the primary cover image. It will be stored in Supabase and saved to cover_url."
                accept="image/*"
              />
              <AssetField
                field="backCoverUrl"
                title="Back cover"
                helper="Upload the back cover artwork or author blurb image for back_cover_url."
                accept="image/*"
              />
              <div className="md:col-span-2">
                <AssetField
                  field="contentUrl"
                  title="Book file"
                  helper="Upload a PDF, EPUB, or other reading file. The stored URL will be saved to content_url."
                  accept=".pdf,.epub,.mobi,.doc,.docx,application/pdf"
                />
              </div>

              <Card className="border-border/70 bg-muted/15 shadow-none md:col-span-2">
                <CardContent className="grid gap-4 p-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-2xl border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Front cover status
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {form.coverUrl
                        ? "Front cover is attached and ready to save."
                        : "No front cover selected yet."}
                    </p>
                  </div>
                  <div className="space-y-2 rounded-2xl border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Back cover status
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {form.backCoverUrl
                        ? "Back cover is attached and ready to save."
                        : "No back cover selected yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4">
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

              <div className="space-y-2 md:col-span-2">
                <Label>Content delivery</Label>
                <div className="rounded-2xl border bg-muted/15 p-4 text-sm text-muted-foreground">
                  {form.contentUrl
                    ? "A book file is attached. Saving will persist its public URL in the book record."
                    : form.isFree
                      ? "Upload a PDF or ebook file in Assets to enable free access."
                      : "Upload a sample or digital file in Assets if this title includes downloadable content."}
                </div>
              </div>

              <Card className="border-border/70 bg-muted/15 shadow-none md:col-span-2">
                <CardContent className="grid gap-4 p-4 md:grid-cols-3">
                  <div className="rounded-2xl border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CircleDollarSign className="h-4 w-4 text-primary" />
                      Pricing mode
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {form.isFree
                        ? "Free title"
                        : form.price
                          ? `INR ${form.price}`
                          : "Paid title without price yet"}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-primary" />
                      Reading access
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {form.contentUrl
                        ? "Content link attached"
                        : "No content link yet"}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Editor state
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {editingBookId
                        ? "Updating existing book"
                        : "Preparing a new book"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isSaving || !form.title.trim()}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingBookId ? "Save book" : "Create book"}
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
