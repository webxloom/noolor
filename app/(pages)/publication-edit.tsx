import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import {
  useGetPublication, useUpdatePublication, useCreateBook, useUpdateBook, useListBooks,
  getGetPublicationQueryKey, getListBooksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookForm, BookFormData } from "@/components/BookForm";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, BookOpen, X, Facebook, Instagram, Youtube, Globe, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";

const LANGUAGES = ["Tamil", "English", "Telugu", "Kannada", "Malayalam", "Hindi", "Sanskrit"];

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
  others?: string[];
}

export default function PublicationEdit() {
  const [, params] = useRoute("/publications/:id/edit");
  const id = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pub, isLoading } = useGetPublication(id, {
    query: { enabled: !!id, queryKey: getGetPublicationQueryKey(id) }
  });
  const { data: booksData } = useListBooks(
    { publicationId: id },
    { query: { enabled: !!id, queryKey: getListBooksQueryKey({ publicationId: id }) } }
  );

  const updatePub = useUpdatePublication();
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [otherLinkInput, setOtherLinkInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [bookDialog, setBookDialog] = useState<{ open: boolean; editing?: { id: number } & Partial<BookFormData> }>({ open: false });
  const [savingBook, setSavingBook] = useState(false);

  useEffect(() => {
    if (pub) {
      setDescription((pub as { description?: string | null }).description ?? "");
      setLocation((pub as { location?: string | null }).location ?? "");
      setLogoUrl((pub as { logoUrl?: string | null }).logoUrl ?? "");
      setLanguages(pub.languages ?? []);
      setSocialLinks((pub as { socialLinks?: SocialLinks | null }).socialLinks ?? {});
    }
  }, [pub]);

  if (!user) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">Please log in.</div>;
  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">{[1,2,3].map(i=><Skeleton key={i} className="h-24"/>)}</div>;
  if (!pub) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">Publication not found.</div>;
  if ((pub as { userId?: number }).userId !== user.id) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">No permission to edit.</div>;

  function toggleLang(lang: string) {
    setLanguages(ls => ls.includes(lang) ? ls.filter(x => x !== lang) : [...ls, lang]);
  }

  function addOtherLink() {
    if (otherLinkInput.trim()) {
      setSocialLinks(s => ({ ...s, others: [...(s.others ?? []), otherLinkInput.trim()] }));
      setOtherLinkInput("");
    }
  }

  function removeOtherLink(i: number) {
    setSocialLinks(s => ({ ...s, others: (s.others ?? []).filter((_, j) => j !== i) }));
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updatePub.mutateAsync({
        id,
        data: {
          description: description || undefined,
          location: location || undefined,
          logoUrl: logoUrl || undefined,
          languages,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetPublicationQueryKey(id) });
      toast({ title: "Publication updated!" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleBookSubmit(data: BookFormData) {
    setSavingBook(true);
    try {
      const bookData = {
        title: data.title,
        language: data.language,
        genre: data.genre,
        description: data.description || undefined,
        isFree: data.isFree,
        price: data.price ? Number(data.price) : undefined,
        pageCount: data.pageCount ? Number(data.pageCount) : undefined,
        publishedYear: data.publishedYear ? Number(data.publishedYear) : undefined,
        coverUrl: data.coverUrl || undefined,
        backCoverUrl: data.backCoverUrl || undefined,
        contentUrl: data.contentUrl || undefined,
        quotes: data.quotes.length > 0 ? data.quotes : undefined,
      };
      if (bookDialog.editing?.id) {
        await updateBook.mutateAsync({ id: bookDialog.editing.id, data: bookData });
        toast({ title: "Book updated!" });
      } else {
        await createBook.mutateAsync({ data: bookData });
        toast({ title: "Book added!" });
      }
      queryClient.invalidateQueries({ queryKey: getListBooksQueryKey({ publicationId: id }) });
      queryClient.invalidateQueries({ queryKey: getGetPublicationQueryKey(id) });
      setBookDialog({ open: false });
    } catch {
      toast({ title: "Failed to save book", variant: "destructive" });
    } finally {
      setSavingBook(false);
    }
  }

  async function handleDeleteBook(bookId: number) {
    if (!confirm("Delete this book?")) return;
    try {
      await fetch(`/api/books/${bookId}`, { method: "DELETE", credentials: "include" });
      queryClient.invalidateQueries({ queryKey: getListBooksQueryKey({ publicationId: id }) });
      toast({ title: "Book deleted" });
    } catch {
      toast({ title: "Failed to delete book", variant: "destructive" });
    }
  }

  const books = booksData?.books ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <Link href={`/publications/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to publication
      </Link>
      <h1 className="text-2xl font-serif font-semibold text-foreground">Edit Publication</h1>

      <form onSubmit={saveProfile} className="space-y-6">

        {/* Logo */}
        <section className="border rounded-lg p-5 bg-card">
          <h2 className="font-semibold text-foreground mb-4">Publication Logo</h2>
          <div className="flex items-start gap-4">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="w-20 h-20 rounded-lg object-contain border flex-shrink-0 bg-muted" />
            )}
            <div className="flex-1">
              <FileUpload
                value={logoUrl}
                onChange={setLogoUrl}
                accept="image"
                label="Upload logo"
                preview="image"
              />
              <p className="text-xs text-muted-foreground mt-2">Or paste an image URL:</p>
              <Input className="mt-1" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="border rounded-lg p-5 bg-card space-y-4">
          <h2 className="font-semibold text-foreground">About</h2>
          <div>
            <Label>Publication Name</Label>
            <Input className="mt-1" value={pub.name} disabled />
            <p className="text-xs text-muted-foreground mt-1">Contact support to change the name.</p>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="mt-1" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your publication..." />
          </div>
          <div>
            <Label>Location</Label>
            <Input className="mt-1" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Chennai, Tamil Nadu" />
          </div>
          <div>
            <Label className="block mb-2">Languages Published</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang} type="button" onClick={() => toggleLang(lang)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${languages.includes(lang) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}
                >{lang}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="border rounded-lg p-5 bg-card space-y-4">
          <h2 className="font-semibold text-foreground">Social Media & Links</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-600" /> Facebook</Label>
              <Input className="mt-1" value={socialLinks.facebook ?? ""} onChange={e => setSocialLinks(s => ({ ...s, facebook: e.target.value || undefined }))} placeholder="https://facebook.com/page" />
            </div>
            <div>
              <Label className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-500" /> Instagram</Label>
              <Input className="mt-1" value={socialLinks.instagram ?? ""} onChange={e => setSocialLinks(s => ({ ...s, instagram: e.target.value || undefined }))} placeholder="https://instagram.com/handle" />
            </div>
            <div>
              <Label className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-600" /> YouTube</Label>
              <Input className="mt-1" value={socialLinks.youtube ?? ""} onChange={e => setSocialLinks(s => ({ ...s, youtube: e.target.value || undefined }))} placeholder="https://youtube.com/@channel" />
            </div>
            <div>
              <Label className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Website</Label>
              <Input className="mt-1" value={socialLinks.website ?? ""} onChange={e => setSocialLinks(s => ({ ...s, website: e.target.value || undefined }))} placeholder="https://yourpublication.com" />
            </div>
          </div>
          <div>
            <Label className="flex items-center gap-2 mb-2"><LinkIcon className="h-4 w-4" /> Other Links</Label>
            {(socialLinks.others ?? []).map((link, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Input value={link} readOnly className="text-sm" />
                <button type="button" onClick={() => removeOtherLink(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={otherLinkInput} onChange={e => setOtherLinkInput(e.target.value)} placeholder="https://..." onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOtherLink(); } }} />
              <Button type="button" variant="outline" onClick={addOtherLink}>Add</Button>
            </div>
          </div>
        </section>

        <Button type="submit" disabled={savingProfile} className="w-full">
          {savingProfile ? "Saving..." : "Save Publication"}
        </Button>
      </form>

      {/* Catalog */}
      <section className="border rounded-lg p-5 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Book Catalog</h2>
          <Button size="sm" className="gap-2" onClick={() => setBookDialog({ open: true })}>
            <Plus className="h-4 w-4" /> Add Book
          </Button>
        </div>
        {books.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No books yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {books.map(book => (
              <div key={book.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {book.coverUrl && <img src={book.coverUrl} alt={book.title} className="w-10 h-14 object-cover rounded flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.language} · {book.genre}</p>
                  {book.isFree && <Badge variant="secondary" className="text-xs mt-1">Free</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setBookDialog({ open: true, editing: { id: book.id, title: book.title, language: book.language, genre: book.genre, isFree: book.isFree, coverUrl: book.coverUrl ?? "" } })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteBook(book.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={bookDialog.open} onOpenChange={open => !open && setBookDialog({ open: false })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{bookDialog.editing?.id ? "Edit Book" : "Add New Book"}</DialogTitle>
          </DialogHeader>
          <BookForm
            initial={bookDialog.editing}
            onSubmit={handleBookSubmit}
            onCancel={() => setBookDialog({ open: false })}
            isSubmitting={savingBook}
            submitLabel={bookDialog.editing?.id ? "Update Book" : "Add Book"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
