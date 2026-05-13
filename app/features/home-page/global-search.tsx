"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, TrendingUp, BookOpen, User, Building2, X } from "lucide-react";
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

export function GlobalSearch() {
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
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
              Discover Your Next Great Read
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Search across books, authors, and publications in Tamil literature
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Search books, authors, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="h-14 pl-12 pr-28 text-base rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-24 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <Button
                type="submit"
                size="lg"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-6 h-12"
              >
                Search
              </Button>
            </div>

            {/* Search Suggestions Dropdown */}
            {isFocused && searchQuery.trim().length > 0 && (
              <Card className="absolute top-full mt-2 w-full z-20 shadow-xl border-2 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Searching...
                    </p>
                  </div>
                ) : showEmptyState ? (
                  <EmptySearchState query={debouncedQuery} />
                ) : suggestions.length > 0 ? (
                  <div className="py-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        className="w-full px-4 py-3 hover:bg-accent text-left transition-colors flex items-center gap-3"
                        onClick={() => {
                          setSearchQuery(suggestion.title);
                          setIsFocused(false);
                        }}
                      >
                        {suggestion.type === "books" && (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                        {suggestion.type === "authors" && (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        {suggestion.type === "publications" && (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {suggestion.title}
                          </div>
                          {suggestion.subtitle && (
                            <div className="text-xs text-muted-foreground">
                              {suggestion.subtitle}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </Card>
            )}
          </form>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {SEARCH_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary-border",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Trending Genres */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Trending Genres
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {TRENDING_GENRES.map((genre) => (
                <Link
                  key={genre}
                  href={`/search?q=${encodeURIComponent(genre)}&category=books`}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-all px-3 py-1.5 text-sm"
                  >
                    {genre}
                  </Badge>
                </Link>
              ))}
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
