import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import {
  useGetAuthor, useUpdateAuthor, useCreateBook, useUpdateBook, useListBooks,
  getGetAuthorQueryKey, getListBooksQueryKey,
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
const GENRES = ["Fiction", "Poetry", "History", "Biography", "Philosophy", "Short Stories", "Novel", "Drama", "Children", "Non-Fiction"];

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
  others?: string[];
}

interface UpcomingWork {
  title: string;
  description: string;
  quote: string;
}

interface Award {
  name: string;
  file: string;
}

export default function AuthorEdit() {
  const [, params] = useRoute("/authors/:id/edit");
  const id = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: author, isLoading } = useGetAuthor(id, {
    query: { enabled: !!id, queryKey: getGetAuthorQueryKey(id) }
  });
  const { data: booksData } = useListBooks(
    { authorId: id },
    { query: { enabled: !!id, queryKey: getListBooksQueryKey({ authorId: id }) } }
  );

  const updateAuthor = useUpdateAuthor();
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();

  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [awardInput, setAwardInput] = useState("");
  const [upcomingWorks, setUpcomingWorks] = useState<UpcomingWork[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [otherLinkInput, setOtherLinkInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [bookDialog, setBookDialog] = useState<{ open: boolean; editing?: { id: number } & Partial<BookFormData> }>({ open: false });
  const [savingBook, setSavingBook] = useState(false);

  useEffect(() => {
    if (author) {
      setBio((author as { bio?: string | null }).bio ?? "");
      setLocation((author as { location?: string | null }).location ?? "");
      setAvatarUrl((author as { avatarUrl?: string | null }).avatarUrl ?? "");
      setLanguages(author.languages ?? []);
      setGenres(author.genres ?? []);
      const awardNames: string[] = (author as { awards?: string[] }).awards ?? [];
      const awardFiles: string[] = (author as { awardFiles?: string[] }).awardFiles ?? [];
      setAwards(awardNames.map((name, i) => ({ name, file: awardFiles[i] ?? "" })));
      const titles: string[] = (author as { upcomingWorks?: string[] }).upcomingWorks ?? [];
      const descs: string[] = (author as { upcomingWorkDescriptions?: string[] }).upcomingWorkDescriptions ?? [];
      const quotes: string[] = (author as { upcomingWorkQuotes?: string[] }).upcomingWorkQuotes ?? [];
      setUpcomingWorks(titles.map((title, i) => ({ title, description: descs[i] ?? "", quote: quotes[i] ?? "" })));
      setSocialLinks((author as { socialLinks?: SocialLinks | null }).socialLinks ?? {});
    }
  }, [author]);

  if (!user) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">Please log in to edit your profile.</div>;
  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">{[1,2,3].map(i=><Skeleton key={i} className="h-24"/>)}</div>;
  if (!author) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">Author not found.</div>;
  if ((author as { userId?: number }).userId !== user.id) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">You don't have permission to edit this profile.</div>;

  function toggleItem(arr: string[], item: string, setter: (a: string[]) => void) {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  function addUpcomingWork() {
    setUpcomingWorks(w => [...w, { title: "", description: "", quote: "" }]);
  }

  function updateUpcomingWork(i: number, field: keyof UpcomingWork, val: string) {
    setUpcomingWorks(w => w.map((item, j) => j === i ? { ...item, [field]: val } : item));
  }

  function removeUpcomingWork(i: number) {
    setUpcomingWorks(w => w.filter((_, j) => j !== i));
  }

  function addAward() {
    if (awardInput.trim()) {
      setAwards(a => [...a, { name: awardInput.trim(), file: "" }]);
      setAwardInput("");
    }
  }

  function updateAwardFile(i: number, url: string) {
    setAwards(a => a.map((award, j) => j === i ? { ...award, file: url } : award));
  }

  function removeAward(i: number) {
    setAwards(a => a.filter((_, j) => j !== i));
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
      await updateAuthor.mutateAsync({
        id,
        data: {
          bio: bio || undefined,
          location: location || undefined,
          avatarUrl: avatarUrl || undefined,
          languages,
          genres,
          awards: awards.map(a => a.name),
          awardFiles: awards.map(a => a.file),
          upcomingWorks: upcomingWorks.map(w => w.title),
          upcomingWorkDescriptions: upcomingWorks.map(w => w.description),
          upcomingWorkQuotes: upcomingWorks.map(w => w.quote),
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetAuthorQueryKey(id) });
      toast({ title: "Profile updated!" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
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
      queryClient.invalidateQueries({ queryKey: getListBooksQueryKey({ authorId: id }) });
      queryClient.invalidateQueries({ queryKey: getGetAuthorQueryKey(id) });
      setBookDialog({ open: false });
    } catch {
      toast({ title: "Failed to save book", variant: "destructive" });
    } finally {
      setSavingBook(false);
    }
  }

  async function handleDeleteBook(bookId: number) {
    if (!confirm("Delete this book? This cannot be undone.")) return;
    try {
      await fetch(`/api/books/${bookId}`, { method: "DELETE", credentials: "include" });
      queryClient.invalidateQueries({ queryKey: getListBooksQueryKey({ authorId: id }) });
      toast({ title: "Book deleted" });
    } catch {
      toast({ title: "Failed to delete book", variant: "destructive" });
    }
  }

  const books = booksData?.books ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <Link href={`/authors/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>
      <h1 className="text-2xl font-serif font-semibold text-foreground">Edit Author Profile</h1>

      <form onSubmit={saveProfile} className="space-y-6">

        {/* Profile photo */}
        <section className="border rounded-lg p-5 bg-card">
          <h2 className="font-semibold text-foreground mb-4">Profile Photo</h2>
          <div className="flex items-start gap-4">
            {avatarUrl && (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border flex-shrink-0" />
            )}
            <div className="flex-1">
              <FileUpload
                value={avatarUrl}
                onChange={setAvatarUrl}
                accept="image"
                label="Upload profile photo"
                preview="image"
              />
              <p className="text-xs text-muted-foreground mt-2">Or paste an image URL:</p>
              <Input className="mt-1" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </section>

        {/* Bio & Location */}
        <section className="border rounded-lg p-5 bg-card space-y-4">
          <h2 className="font-semibold text-foreground">About</h2>
          <div>
            <Label>Bio</Label>
            <Textarea className="mt-1" rows={5} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell readers about yourself..." />
          </div>
          <div>
            <Label>Location</Label>
            <Input className="mt-1" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Chennai, Tamil Nadu" />
          </div>
        </section>

        {/* Languages & Genres */}
        <section className="border rounded-lg p-5 bg-card space-y-4">
          <h2 className="font-semibold text-foreground">Literary Focus</h2>
          <div>
            <Label className="block mb-2">Languages</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang} type="button" onClick={() => toggleItem(languages, lang, setLanguages)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${languages.includes(lang) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}
                >{lang}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="block mb-2">Genres</Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button key={g} type="button" onClick={() => toggleItem(genres, g, setGenres)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${genres.includes(g) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}
                >{g}</button>
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
              <Input className="mt-1" value={socialLinks.facebook ?? ""} onChange={e => setSocialLinks(s => ({ ...s, facebook: e.target.value || undefined }))} placeholder="https://facebook.com/yourpage" />
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
              <Label className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Personal Website</Label>
              <Input className="mt-1" value={socialLinks.website ?? ""} onChange={e => setSocialLinks(s => ({ ...s, website: e.target.value || undefined }))} placeholder="https://yourwebsite.com" />
            </div>
          </div>
          <div>
            <Label className="flex items-center gap-2 mb-2"><LinkIcon className="h-4 w-4" /> Other Links</Label>
            {(socialLinks.others ?? []).map((link, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Input value={link} readOnly className="text-sm" />
                <button type="button" onClick={() => removeOtherLink(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={otherLinkInput} onChange={e => setOtherLinkInput(e.target.value)} placeholder="https://..." onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOtherLink(); } }} />
              <Button type="button" variant="outline" onClick={addOtherLink}>Add</Button>
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="border rounded-lg p-5 bg-card space-y-4">
          <h2 className="font-semibold text-foreground">Awards & Recognition</h2>
          <div className="space-y-3">
            {awards.map((award, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Input value={award.name} onChange={e => setAwards(a => a.map((item, j) => j === i ? { ...item, name: e.target.value } : item))} placeholder="Award name..." className="flex-1 text-sm" />
                  <button type="button" onClick={() => removeAward(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Award certificate or image (optional)</Label>
                  <FileUpload
                    value={award.file}
                    onChange={url => updateAwardFile(i, url)}
                    accept="any"
                    label="Upload certificate or photo"
                    preview="image"
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={awardInput} onChange={e => setAwardInput(e.target.value)} placeholder="Award or recognition name..." onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAward(); } }} />
              <Button type="button" variant="outline" onClick={addAward}>Add</Button>
            </div>
          </div>
        </section>

        {/* Upcoming Works */}
        <section className="border rounded-lg p-5 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Upcoming Works</h2>
            <Button type="button" variant="outline" size="sm" onClick={addUpcomingWork} className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          {upcomingWorks.length === 0 && (
            <p className="text-sm text-muted-foreground">Share what you're working on next.</p>
          )}
          <div className="space-y-4">
            {upcomingWorks.map((work, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Input value={work.title} onChange={e => updateUpcomingWork(i, "title", e.target.value)} placeholder="Book title..." className="flex-1 font-medium" />
                  <button type="button" onClick={() => removeUpcomingWork(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0"><X className="h-4 w-4" /></button>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Short description</Label>
                  <Textarea value={work.description} onChange={e => updateUpcomingWork(i, "description", e.target.value)} placeholder="What is this book about?" className="mt-1 text-sm" rows={2} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Sample quote or excerpt</Label>
                  <Textarea value={work.quote} onChange={e => updateUpcomingWork(i, "quote", e.target.value)} placeholder="Share a teaser quote..." className="mt-1 text-sm italic" rows={2} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <Button type="submit" disabled={savingProfile} className="w-full">
          {savingProfile ? "Saving Profile..." : "Save Profile"}
        </Button>
      </form>

      {/* Books section */}
      <section className="border rounded-lg p-5 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Your Books</h2>
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
