import { useState } from "react";
import { useListBlogs, getListBlogsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Search, FileText, Plus, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function Blogs() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { user } = useAuth();

  const { data, isLoading } = useListBlogs(
    { search: debouncedSearch || undefined, limit: 20 },
    { query: { queryKey: getListBlogsQueryKey({ search: debouncedSearch || undefined }) } }
  );

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as unknown as { _blogSearchTimer?: ReturnType<typeof setTimeout> })._blogSearchTimer);
    (window as unknown as { _blogSearchTimer?: ReturnType<typeof setTimeout> })._blogSearchTimer = setTimeout(() => {
      setDebouncedSearch(val);
    }, 400);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-1">Blogs</h1>
          <p className="text-muted-foreground">Voices, reflections, and stories from Tamil writers</p>
        </div>
        {user && (user.role === "writer" || user.role === "publication" || (user.role === "reader" && user.isPremium)) && (
          <Link href="/blogs/new">
            <Button data-testid="button-new-blog" className="gap-2">
              <Plus className="h-4 w-4" /> Write
            </Button>
          </Link>
        )}
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="input-search-blogs"
          type="search"
          placeholder="Search blogs..."
          className="pl-10"
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : !data?.blogs?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No blog posts yet</p>
          {user && <p className="text-sm mt-2">Be the first to share your story</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {data.blogs.map(blog => (
            <Link key={blog.id} href={`/blogs/${blog.id}`} data-testid={`card-blog-${blog.id}`}>
              <article className="border rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition-all bg-card cursor-pointer">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-serif font-semibold text-foreground mb-1 line-clamp-2">
                      {blog.title}
                    </h2>
                    {blog.authorName && (
                      <p className="text-sm text-muted-foreground mb-2">by {blog.authorName}</p>
                    )}
                    {blog.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{blog.language}</Badge>
                      {blog.publishedAt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
