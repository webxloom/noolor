"use client";
import Link from "next/link";
import {
  Search,
  BookOpen,
  PenTool,
  Library,
  Users,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { AuthorCard } from "./components/shared/author-card";
import { BlogCard } from "./components/shared/blog-card";
import { BookCard } from "./components/shared/book-card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Skeleton } from "./components/ui/skeleton";
import { useState } from "react";
import { Badge } from "./components/ui/badge";
import { HeroSection } from "./features/home-page/hero-section";
import { GlobalSearch } from "./features/home-page/global-search";
import FeaturedBooks from "./features/home-page/featured-books";
import FeaturedAuthors from "./features/home-page/featured-authors";
import { HowItWorks } from "./features/home-page/how-it-works";

const stats = {
  totalBooks: 1250,
  totalAuthors: 300,
  totalPublications: 50,
  totalUsers: 5000,
};

const isLoadingStats = false;
const isLoadingFeatured = false;

// Sample data for featured sections
const featured = {
  recentBlogs: [
    {
      id: "1",
      title: "The Enduring Legacy of Tamil Epics",
      authorName: "Dr. Ananya Iyer",
      authorAvatar: "",
      coverUrl: "",
      publishedAt: "2024-05-10",
      excerpt:
        "Tamil epics like Silappatikaram and Manimekalai continue to inspire readers with their timeless themes of love, justice, and morality. In this essay, we explore the enduring relevance of these ancient tales in contemporary society.",
      language: "Tamil",
    },
    {
      id: "2",
      title: "Kalki Krishnamurthy: A Literary Icon",
      authorName: "Suresh Ramanujam",
      authorAvatar: "",
      coverUrl: "",
      publishedAt: "2024-04-22",
      excerpt:
        "Kalki Krishnamurthy's contributions to Tamil literature are unparalleled. From his historical novels to his incisive journalism, Kalki's work has left an indelible mark on the literary landscape. This article delves into his life, works, and lasting influence.",
      language: "Tamil",
    },
    {
      id: "3",
      title: "The Philosophy of Thirukkural",
      authorName: "Dr. Meena Subramanian",
      authorAvatar: "",
      coverUrl: "",
      publishedAt: "2024-03-15",
      excerpt:
        "Thirukkural, composed by the sage Thiruvalluvar, is a masterpiece of ethical and philosophical thought. In this blog post, we examine the core teachings of Thirukkural and their relevance in today's world.",
      language: "Tamil",
    },
  ],
};

export default function Home() {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // if (searchQuery.trim()) {
    //   setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    // }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Global Search */}
      <GlobalSearch />

      {/* Featured Books */}
      <FeaturedBooks
        setLocation={setLocation}
        isLoadingFeatured={isLoadingFeatured}
      />

      {/* Featured Authors */}
      <FeaturedAuthors
        setLocation={setLocation}
        isLoadingFeatured={isLoadingFeatured}
      />

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            Join the Literary Commons
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10">
            Whether you're an author sharing your craft, a publication
            showcasing your catalog, or a reader exploring new worlds — there is
            a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold"
              onClick={() => setLocation("/register")}
            >
              Create an Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 font-semibold"
              onClick={() => setLocation("/explore")}
            >
              Explore Library
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Stats Section */}
      {/* <section className="border-y bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem
              icon={<BookOpen />}
              label="Books"
              value={stats?.totalBooks}
              loading={isLoadingStats}
            />
            <StatItem
              icon={<PenTool />}
              label="Authors"
              value={stats?.totalAuthors}
              loading={isLoadingStats}
            />
            <StatItem
              icon={<Library />}
              label="Publications"
              value={stats?.totalPublications}
              loading={isLoadingStats}
            />
            <StatItem
              icon={<Users />}
              label="Readers"
              value={stats?.totalUsers}
              loading={isLoadingStats}
            />
          </div>
        </div>
      </section> */}

      {/* Recent Essays/Blogs */}
      {/* <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-2">
              Essays & Discourse
            </h2>
            <p className="text-muted-foreground">
              Thoughts on literature, culture, and craft
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:flex group"
            onClick={() => setLocation("/blogs")}
          >
            Read more{" "}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoadingFeatured
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="w-full aspect-[16/9] rounded-xl" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            : featured?.recentBlogs
                ?.slice(0, 3)
                .map((blog) => <BlogCard key={blog.id} blog={blog} />)}
        </div>
        <Button
          variant="outline"
          className="w-full mt-8 sm:hidden"
          onClick={() => setLocation("/blogs")}
        >
          Read more essays
        </Button>
      </section> */}
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
        {icon}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16 mb-1" />
      ) : (
        <div className="text-3xl font-bold font-serif">
          {value?.toLocaleString() || 0}
        </div>
      )}
      <div className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
