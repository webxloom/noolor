import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";
import { Plus, X, Loader2, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = ["Tamil", "English", "Telugu", "Kannada", "Malayalam", "Hindi", "Sanskrit"];
const GENRES = ["Fiction", "Poetry", "History", "Biography", "Philosophy", "Short Stories", "Novel", "Drama", "Children", "Non-Fiction", "Self-Help", "Spirituality"];

export interface BookFormData {
  title: string;
  language: string;
  genre: string;
  description: string;
  isFree: boolean;
  price: string;
  pageCount: string;
  publishedYear: string;
  coverUrl: string;
  backCoverUrl: string;
  contentUrl: string;
  quotes: string[];
}

interface BookFormProps {
  initial?: Partial<BookFormData>;
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function BookForm({ initial, onSubmit, onCancel, isSubmitting, submitLabel = "Save" }: BookFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<BookFormData>({
    title: initial?.title ?? "",
    language: initial?.language ?? "Tamil",
    genre: initial?.genre ?? "Fiction",
    description: initial?.description ?? "",
    isFree: initial?.isFree ?? false,
    price: initial?.price ?? "",
    pageCount: initial?.pageCount ?? "",
    publishedYear: initial?.publishedYear ?? "",
    coverUrl: initial?.coverUrl ?? "",
    backCoverUrl: initial?.backCoverUrl ?? "",
    contentUrl: initial?.contentUrl ?? "",
    quotes: initial?.quotes ?? [],
  });
  const [quoteInput, setQuoteInput] = useState("");

  function set<K extends keyof BookFormData>(key: K, val: BookFormData[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function addQuote() {
    if (quoteInput.trim()) {
      set("quotes", [...form.quotes, quoteInput.trim()]);
      setQuoteInput("");
    }
  }

  function removeQuote(i: number) {
    set("quotes", form.quotes.filter((_, j) => j !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label>Book Title *</Label>
          <Input
            className="mt-1"
            value={form.title}
            onChange={e => set("title", e.target.value)}
            placeholder="Enter book title..."
            required
          />
        </div>

        <div>
          <Label>Language</Label>
          <Select value={form.language} onValueChange={v => set("language", v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Genre</Label>
          <Select value={form.genre} onValueChange={v => set("genre", v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Page Count</Label>
          <Input className="mt-1" type="number" min="1" value={form.pageCount} onChange={e => set("pageCount", e.target.value)} placeholder="e.g. 256" />
        </div>

        <div>
          <Label>Published Year</Label>
          <Input className="mt-1" type="number" min="1800" max={new Date().getFullYear()} value={form.publishedYear} onChange={e => set("publishedYear", e.target.value)} placeholder="e.g. 2023" />
        </div>

        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Textarea className="mt-1" value={form.description} onChange={e => set("description", e.target.value)} placeholder="What is this book about?" rows={4} />
        </div>

        <div>
          <Label className="block mb-2">Front Cover Image</Label>
          <FileUpload
            value={form.coverUrl}
            onChange={v => set("coverUrl", v)}
            accept="image"
            label="Upload front cover"
            preview="image"
          />
        </div>

        <div>
          <Label className="block mb-2">Back Cover Image</Label>
          <FileUpload
            value={form.backCoverUrl}
            onChange={v => set("backCoverUrl", v)}
            accept="image"
            label="Upload back cover"
            preview="image"
          />
        </div>

        <div className="sm:col-span-2">
          <Label className="block mb-2">Sample Quotes</Label>
          <div className="space-y-2">
            {form.quotes.map((q, i) => (
              <div key={i} className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg border">
                <Quote className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm flex-1 italic">{q}</p>
                <button type="button" onClick={() => removeQuote(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Textarea
                value={quoteInput}
                onChange={e => setQuoteInput(e.target.value)}
                placeholder="Add a memorable quote from this book..."
                className="text-sm"
                rows={2}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) addQuote(); }}
              />
              <Button type="button" variant="outline" size="sm" className="self-end gap-1" onClick={addQuote} disabled={!quoteInput.trim()}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Press Ctrl+Enter or click Add</p>
          </div>
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <Switch id="book-free" checked={form.isFree} onCheckedChange={v => set("isFree", v)} />
          <Label htmlFor="book-free">Free ebook (readers can download)</Label>
        </div>

        {!form.isFree && (
          <div>
            <Label>Price (₹)</Label>
            <Input className="mt-1" type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} placeholder="e.g. 299" />
          </div>
        )}

        {form.isFree && (
          <div className="sm:col-span-2">
            <Label className="block mb-2">Upload Free Ebook (PDF)</Label>
            <FileUpload
              value={form.contentUrl}
              onChange={v => set("contentUrl", v)}
              accept="pdf"
              label="Upload PDF ebook"
              preview="none"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting || !form.title.trim()}>
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{submitLabel}...</> : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
