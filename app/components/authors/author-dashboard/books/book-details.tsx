import { ChangeEvent } from "react";
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
import { BOOK_LANGUAGES, BOOK_GENRES } from "./shared";

export default function BookDetails({
  form,
  setField,
  quoteInput,
  setQuoteInput,
}: {
  form: any;
  setField: any;
  quoteInput: string;
  setQuoteInput: (value: string) => void;
}) {
  return (
    <>
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
          onChange={(event) => setField("pageCount", event.target.value)}
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
          onChange={(event) => setField("publishedYear", event.target.value)}
          placeholder="2025"
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
    </>
  );
}
