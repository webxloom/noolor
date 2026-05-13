import { useGetPlatformStats, useGetFeatured } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/shared/BookCard";
import { AuthorCard } from "@/components/shared/AuthorCard";
import { BlogCard } from "@/components/shared/BlogCard";
import { Search, ArrowRight, BookOpen, PenTool, Users, Library } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: stats, isLoading: isLoadingStats } = useGetPlatformStats();
  const { data: featured, isLoading: isLoadingFeatured } = useGetFeatured();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden bg-primary/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03] mix-blend-multiply pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">A Home for Tamil Literature</Badge>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Discover the Depth of <br className="hidden md:block" />
            <span className="text-primary italic">Tamil Letters</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Connect with writers, explore profound publications, and track your reading journey in a dignified space built for the love of words.
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-xl flex gap-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search for books, authors, or publications..." 
              className="h-14 pl-12 pr-4 rounded-full bg-background border-border shadow-sm text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="h-14 rounded-full px-8 absolute right-1 top-1/2 -translate-y-1/2" size="lg">
              Search
            </Button>
          </form>
          
          <div className="mt-8 flex gap-4 text-sm font-medium text-muted-foreground">
            <span>Popular:</span>
            <Link href="/search?q=poetry" className="hover:text-primary transition-colors">Poetry</Link>
            <Link href="/search?q=history" className="hover:text-primary transition-colors">History</Link>
            <Link href="/search?q=fiction" className="hover:text-primary transition-colors">Fiction</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem icon={<BookOpen />} label="Books" value={stats?.totalBooks} loading={isLoadingStats} />
            <StatItem icon={<PenTool />} label="Authors" value={stats?.totalAuthors} loading={isLoadingStats} />
            <StatItem icon={<Library />} label="Publications" value={stats?.totalPublications} loading={isLoadingStats} />
            <StatItem icon={<Users />} label="Readers" value={stats?.totalUsers} loading={isLoadingStats} />
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-2">New & Notable</h2>
            <p className="text-muted-foreground">Curated selections from our library</p>
          </div>
          <Button variant="ghost" className="hidden sm:flex group" onClick={() => setLocation('/books')}>
            View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {isLoadingFeatured ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : (
            featured?.featuredBooks?.slice(0, 5).map(book => (
              <BookCard key={book.id} book={book} />
            ))
          )}
        </div>
        <Button variant="outline" className="w-full mt-8 sm:hidden" onClick={() => setLocation('/books')}>
          View all books
        </Button>
      </section>

      {/* Featured Authors */}
      <section className="py-16 md:py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-2">Voices of Noolor</h2>
              <p className="text-muted-foreground">Discover brilliant writers and their stories</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex group" onClick={() => setLocation('/authors')}>
              View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingFeatured ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] rounded-xl" />
              ))
            ) : (
              featured?.featuredAuthors?.slice(0, 4).map(author => (
                <AuthorCard key={author.id} author={author} />
              ))
            )}
          </div>
          <Button variant="outline" className="w-full mt-8 sm:hidden" onClick={() => setLocation('/authors')}>
            View all authors
          </Button>
        </div>
      </section>

      {/* Recent Essays/Blogs */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-2">Essays & Discourse</h2>
            <p className="text-muted-foreground">Thoughts on literature, culture, and craft</p>
          </div>
          <Button variant="ghost" className="hidden sm:flex group" onClick={() => setLocation('/blogs')}>
            Read more <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoadingFeatured ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-[16/9] rounded-xl" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : (
            featured?.recentBlogs?.slice(0, 3).map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))
          )}
        </div>
        <Button variant="outline" className="w-full mt-8 sm:hidden" onClick={() => setLocation('/blogs')}>
          Read more essays
        </Button>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Join the Literary Commons</h2>
          <p className="text-primary-foreground/80 text-lg mb-10">
            Whether you're an author sharing your craft, a publication showcasing your catalog, or a reader exploring new worlds — there is a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="font-semibold" onClick={() => setLocation('/register')}>
              Create an Account
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 font-semibold" onClick={() => setLocation('/explore')}>
              Explore Library
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatItem({ icon, label, value, loading }: { icon: React.ReactNode, label: string, value?: number, loading: boolean }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
        {icon}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16 mb-1" />
      ) : (
        <div className="text-3xl font-bold font-serif">{value?.toLocaleString() || 0}</div>
      )}
      <div className="text-sm font-medium tracking-widest uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
