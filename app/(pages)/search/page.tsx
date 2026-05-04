"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchIcon, BookOpen, User, Building2, FileText } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Blog } from "@/app/components/shared/blog-card";
import { Book } from "@/app/components/shared/book-card";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";

function parseSearch(search: string) {
  const params = new URLSearchParams(search);
  return params.get("q") ?? "";
}

type Publication = {
  id: string;
  name: string;
  location?: string;
};

type Author = {
  id: string;
  name: string;
  location?: string;
  languages: string[];
};

type SearchData = {
  total: number;
  books: Book[];
  authors: Author[];
  publications: Publication[];
  blogs: Blog[];
};

const data: SearchData = {
  total: 8,
  books: [
    {
      id: "1",
      title: "The Great Gatsby",
      authorName: "F. Scott Fitzgerald",
      coverUrl: "",
      isFree: true,
      language: "English",
      genre: "Classic",
      reviewCount: 1200,
    },
    {
      id: "2",
      title: "To Kill a Mockingbird",
      authorName: "Harper Lee",
      coverUrl: "",
      isFree: false,
      language: "English",
      genre: "Classic",
      reviewCount: 1500,
    },
  ],
  authors: [
    {
      id: "1",
      name: "F. Scott Fitzgerald",
      location: "United States",
      languages: ["English"],
    },
    {
      id: "2",
      name: "Harper Lee",
      location: "United States",
      languages: ["English"],
    },
  ],
  publications: [
    { id: "1", name: "Scribner", location: "New York" },
    { id: "2", name: "J.B. Lippincott", location: "Philadelphia" },
  ],
  blogs: [
    {
      id: "1",
      title: "Classic Literature Review",
      authorName: "John Doe",
      language: "Tamil",
      publishedAt: "2024-01-01",
    },
    {
      id: "2",
      title: "Modern Reading Trends",
      authorName: "Jane Smith",
      language: "English",
      publishedAt: "2024-02-15",
    },
  ],
};

const isLoading = false;

export default function Search() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [activeTab, setActiveTab] = useState("all");

  // const { data, isLoading } = useSearch(
  //   { q: query, type: activeTab as "all" | "books" | "authors" | "publications" | "blogs" },
  //   {
  //     query: {
  //       enabled: query.length > 1,
  //       queryKey: getSearchQueryKey({ q: query, type: activeTab as "all" }),
  //     }
  //   }
  // );

  function handleSearch(val: string) {
    setQuery(val);
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredData = useMemo<SearchData | undefined>(() => {
    if (normalizedQuery.length <= 1) {
      return undefined;
    }

    const books = data.books.filter(
      (book) =>
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.authorName?.toLowerCase().includes(normalizedQuery) ||
        book.language.toLowerCase().includes(normalizedQuery) ||
        book.genre.toLowerCase().includes(normalizedQuery),
    );

    const authors = data.authors.filter(
      (author) =>
        author.name.toLowerCase().includes(normalizedQuery) ||
        author.location?.toLowerCase().includes(normalizedQuery) ||
        author.languages.some((language) =>
          language.toLowerCase().includes(normalizedQuery),
        ),
    );

    const publications = data.publications.filter(
      (publication) =>
        publication.name.toLowerCase().includes(normalizedQuery) ||
        publication.location?.toLowerCase().includes(normalizedQuery),
    );

    const blogs = data.blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(normalizedQuery) ||
        blog.authorName?.toLowerCase().includes(normalizedQuery) ||
        blog.language.toLowerCase().includes(normalizedQuery),
    );

    return {
      total: books.length + authors.length + publications.length + blogs.length,
      books,
      authors,
      publications,
      blogs,
    };
  }, [normalizedQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-serif font-semibold text-foreground mb-6">
        Search
      </h1>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          data-testid="input-global-search"
          type="search"
          placeholder="Search for books, authors, publications, blogs..."
          className="pl-10 text-base py-5"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />
      </div>

      {query.length > 1 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All {filteredData && `(${filteredData.total})`}
            </TabsTrigger>
            <TabsTrigger value="books">
              Books {filteredData && `(${filteredData.books.length})`}
            </TabsTrigger>
            <TabsTrigger value="authors">
              Authors {filteredData && `(${filteredData.authors.length})`}
            </TabsTrigger>
            <TabsTrigger value="publications">
              Publishers{" "}
              {filteredData && `(${filteredData.publications.length})`}
            </TabsTrigger>
            <TabsTrigger value="blogs">
              Blogs {filteredData && `(${filteredData.blogs.length})`}
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="all">
                <SearchResults data={filteredData} />
              </TabsContent>
              <TabsContent value="books">
                <BookResults books={filteredData?.books ?? []} />
              </TabsContent>
              <TabsContent value="authors">
                <AuthorResults authors={filteredData?.authors ?? []} />
              </TabsContent>
              <TabsContent value="publications">
                <PublicationResults
                  publications={filteredData?.publications ?? []}
                />
              </TabsContent>
              <TabsContent value="blogs">
                <BlogResults blogs={filteredData?.blogs ?? []} />
              </TabsContent>
            </>
          )}
        </Tabs>
      )}

      {query.length <= 1 && (
        <div className="text-center py-16 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Type at least 2 characters to search</p>
        </div>
      )}
    </div>
  );
}

function SearchResults({ data }: { data: SearchData | undefined }) {
  if (!data || data.total === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No results found
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {data.books.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Books
          </h3>
          <BookResults books={data.books} />
        </section>
      )}
      {data.authors.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Authors
          </h3>
          <AuthorResults authors={data.authors} />
        </section>
      )}
      {data.publications.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Publications
          </h3>
          <PublicationResults publications={data.publications} />
        </section>
      )}
      {data.blogs.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Blogs
          </h3>
          <BlogResults blogs={data.blogs} />
        </section>
      )}
    </div>
  );
}

function BookResults({ books }: { books: Book[] }) {
  return (
    <div className="space-y-2">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/books/${book.id}`}
          data-testid={`result-book-${book.id}`}
        >
          <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary/40 transition-all bg-card cursor-pointer">
            <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {book.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {book.language} · {book.genre}
              </p>
            </div>
            {book.isFree && (
              <Badge variant="secondary" className="text-xs">
                Free
              </Badge>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function AuthorResults({ authors }: { authors: Author[] }) {
  return (
    <div className="space-y-2">
      {authors.map((author) => (
        <Link
          key={author.id}
          href={`/authors/${author.id}`}
          data-testid={`result-author-${author.id}`}
        >
          <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary/40 transition-all bg-card cursor-pointer">
            <User className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{author.name}</p>
              {author.location && (
                <p className="text-xs text-muted-foreground">
                  {author.location}
                </p>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {author.languages.slice(0, 2).map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PublicationResults({ publications }: { publications: Publication[] }) {
  return (
    <div className="space-y-2">
      {publications.map((pub) => (
        <Link
          key={pub.id}
          href={`/publications/${pub.id}`}
          data-testid={`result-pub-${pub.id}`}
        >
          <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary/40 transition-all bg-card cursor-pointer">
            <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{pub.name}</p>
              {pub.location && (
                <p className="text-xs text-muted-foreground">{pub.location}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function BlogResults({ blogs }: { blogs: Blog[] }) {
  return (
    <div className="space-y-2">
      {blogs.map((blog) => (
        <Link
          key={blog.id}
          href={`/blogs/${blog.id}`}
          data-testid={`result-blog-${blog.id}`}
        >
          <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary/40 transition-all bg-card cursor-pointer">
            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {blog.title}
              </p>
              {blog.authorName && (
                <p className="text-xs text-muted-foreground">
                  by {blog.authorName}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {blog.language}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
