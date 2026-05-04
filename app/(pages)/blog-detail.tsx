import { useRoute } from "wouter";
import { useGetBlog, getGetBlogQueryKey } from "@workspace/api-client-react";
import { FileText, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogDetail() {
  const [, params] = useRoute("/blogs/:id");
  const id = Number(params?.id);

  const { data: blog, isLoading } = useGetBlog(id, {
    query: { enabled: !!id, queryKey: getGetBlogQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>Blog post not found</p>
      </div>
    );
  }

  return (
    <article className="max-w-2xl mx-auto px-4 py-10">
      <header className="mb-8">
        <Badge variant="secondary" className="mb-4">{blog.language}</Badge>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-4 leading-tight">
          {blog.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          {blog.authorName && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" /> {blog.authorName}
            </span>
          )}
          {blog.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
      </header>

      {blog.excerpt && (
        <p className="text-lg text-muted-foreground italic border-l-2 border-primary/40 pl-4 mb-8 leading-relaxed">
          {blog.excerpt}
        </p>
      )}

      <div className="prose prose-neutral max-w-none text-foreground leading-relaxed">
        {(blog as { content?: string }).content?.split('\n').map((para, i) => (
          para.trim() ? <p key={i} className="mb-4">{para}</p> : null
        ))}
      </div>
    </article>
  );
}
