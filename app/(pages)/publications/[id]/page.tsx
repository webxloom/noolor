import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, BookOpen, FileText } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { samplePublications } from "@/lib/sample-publications";

export function generateStaticParams() {
  return samplePublications.map((publication) => ({ id: publication.id }));
}

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pub = samplePublications.find((publication) => publication.id === id);

  if (!pub) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="border rounded-lg p-8 bg-card mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-serif font-semibold text-foreground">
                {pub.name}
              </h1>
            </div>
            {pub.location && (
              <p className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                <MapPin className="h-4 w-4" /> {pub.location}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {pub.languages.map((lang) => (
                <Badge key={lang} variant="secondary">
                  {lang}
                </Badge>
              ))}
            </div>
            {pub.description && (
              <p className="text-muted-foreground leading-relaxed">
                {pub.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {pub.books.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Published Books
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pub.books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                data-testid={`card-book-${book.id}`}
              >
                <div className="border rounded-lg p-4 hover:border-primary/40 transition-all bg-card cursor-pointer">
                  <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {book.genre}
                    </Badge>
                    {book.isFree && (
                      <Badge className="text-xs bg-green-100 text-green-700 border-0">
                        Free
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {pub.blogs.length > 0 && (
        <section>
          <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Blog Posts
          </h2>
          <div className="space-y-3">
            {pub.blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.id}`}
                data-testid={`card-blog-${blog.id}`}
              >
                <div className="border rounded-lg p-4 hover:border-primary/40 transition-all bg-card cursor-pointer">
                  <h3 className="font-medium text-foreground">{blog.title}</h3>
                  {blog.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <Link href="/publications">
          <Button variant="outline">Back to Publications</Button>
        </Link>
      </div>
    </div>
  );
}
