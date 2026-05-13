import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateBlog, getListBlogsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const LANGUAGES = ["Tamil", "English", "Telugu", "Kannada", "Malayalam", "Hindi"];

export default function BlogNew() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [language, setLanguage] = useState("Tamil");
  const [isPublished, setIsPublished] = useState(false);

  const createBlog = useCreateBlog();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <p>Please log in to write a blog post.</p>
        <Link href="/login"><Button className="mt-4">Log in</Button></Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createBlog.mutate(
      { data: { title, content, excerpt: excerpt || undefined, language, isPublished } },
      {
        onSuccess: (blog) => {
          queryClient.invalidateQueries({ queryKey: getListBlogsQueryKey() });
          toast({ title: isPublished ? "Blog published!" : "Draft saved" });
          setLocation(`/blogs/${blog.id}`);
        },
        onError: () => {
          toast({ title: "Failed to save blog", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/blogs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to blogs
      </Link>

      <h1 className="text-2xl font-serif font-semibold text-foreground mb-6">Write a Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="blog-title">Title</Label>
          <Input
            id="blog-title"
            data-testid="input-blog-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter your blog title..."
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="blog-excerpt">Excerpt (optional)</Label>
          <Input
            id="blog-excerpt"
            data-testid="input-blog-excerpt"
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="A brief description of your post..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="blog-language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="blog-language" data-testid="select-blog-language" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="blog-content">Content</Label>
          <Textarea
            id="blog-content"
            data-testid="textarea-blog-content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your blog post here..."
            className="mt-1 min-h-[300px] font-serif"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="blog-publish"
            data-testid="switch-blog-publish"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="blog-publish">Publish immediately</Label>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            data-testid="button-submit-blog"
            disabled={createBlog.isPending || !title.trim() || !content.trim()}
          >
            {createBlog.isPending ? "Saving..." : isPublished ? "Publish" : "Save Draft"}
          </Button>
          <Link href="/blogs">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
