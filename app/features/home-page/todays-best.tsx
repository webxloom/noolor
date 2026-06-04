"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  BookOpen,
  User,
  Building2,
  X,
  CheckCircle,
  Trophy,
} from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/lib/utils";

type SearchCategory = "all" | "books" | "authors" | "publications";

interface SearchSuggestion {
  id: string;
  type: SearchCategory;
  title: string;
  subtitle?: string;
}

// Trending genres to show
const TRENDING_GENRES = [
  "Poetry",
  "Fiction",
  "History",
  "Short Stories",
  "Biography",
  "Philosophy",
];

// Search categories
const SEARCH_CATEGORIES = [
  { value: "all" as const, label: "All", icon: Search },
  { value: "books" as const, label: "Books", icon: BookOpen },
  { value: "authors" as const, label: "Authors", icon: User },
  { value: "publications" as const, label: "Publications", icon: Building2 },
];

export function TodaysBest() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<SearchCategory>("all");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Simulate search (replace with actual API call later)
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      setIsSearching(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        // TODO: Replace with actual API call
        // For now, return empty results
        setSuggestions([]);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  }, [debouncedQuery, selectedCategory]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // TODO: Navigate to search results page
        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`;
      }
    },
    [searchQuery, selectedCategory],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSuggestions([]);
  }, []);

  const showEmptyState =
    debouncedQuery.trim().length > 0 &&
    suggestions.length === 0 &&
    !isSearching;

  return (
    <section className="relative w-full py-16 md:py-20 bg-background border-y border-border">
      <div className="container relative mx-auto px-4 md:px-6 z-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Writer of the Day */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md">
            <Badge className="rounded-full bg-green-100 px-3 py-1 text-green-700 hover:bg-green-100">
              ✨ Writer of the Day
            </Badge>

            <div className="mt-6 text-center">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full">
                <Image
                  src="/author1.avif"
                  alt="Writer"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="mt-4 text-2xl font-bold">Janaki Ramanathan</h3>

              <p className="mt-1 text-muted-foreground">
                ✍️ Award-winning Tamil novelist
              </p>

              <Badge className="mt-3 bg-green-600 text-white hover:bg-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified Writer
              </Badge>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />

                <span>
                  <strong>Books:</strong> 8 Novels, 3 Poetry Collections
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />

                <span>
                  <strong>Awards:</strong> Sahitya Akademi, Kalaimamani
                </span>
              </div>
            </div>

            <Button className="mt-6 w-full" variant="outline">
              View Profile
            </Button>
          </div>

          {/* Book of the Day */}

          <div className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md">
            <Badge className="rounded-full bg-red-100 px-3 py-1 text-red-700 hover:bg-red-100">
              📘 Book of the Day
            </Badge>

            <div className="mt-5 flex gap-4">
              <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/author1.avif"
                  alt="Book Cover"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col">
                <h3 className="text-xl font-bold">Verukku Neer</h3>

                <p className="text-sm text-muted-foreground">
                  Janaki Ramanathan
                </p>

                <Badge variant="secondary" className="mt-2 w-fit">
                  Fiction • Historical
                </Badge>

                <p className="mt-3 text-sm text-muted-foreground">
                  A compelling story about love, resistance, and hope across
                  generations.
                </p>

                <blockquote className="mt-3 border-l-2 pl-3 text-sm italic text-muted-foreground">
                  ⭐ "Deeply moving and beautifully written." — The Hindu
                </blockquote>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1">Read More</Button>

              <Button variant="outline" className="flex-1">
                Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Empty State Component
function EmptySearchState({ query }: { query: string }) {
  return (
    <div className="p-8 md:p-12 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-serif font-bold text-foreground mb-3">
          Noolor is preparing its first literary collection
        </h3>
        <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto">
          Be among the first writers to showcase your work and help build a
          vibrant Tamil literary community.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/register">
          <Button size="lg" className="w-full sm:w-auto">
            Become a Writer
          </Button>
        </Link>
        <Link href="/books">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Explore Platform
          </Button>
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          No results found for{" "}
          <span className="font-semibold text-foreground">"{query}"</span>
        </p>
      </div>
    </div>
  );
}
