"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Building2, MapPin, BookOpen } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { samplePublications } from "@/lib/sample-publications";

const isLoading = false;

export default function Publications() {
  const [search, setSearch] = useState("");

  const filteredPublications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return samplePublications;
    }

    return samplePublications.filter((publication) => {
      return (
        publication.name.toLowerCase().includes(normalizedSearch) ||
        publication.location?.toLowerCase().includes(normalizedSearch) ||
        publication.description?.toLowerCase().includes(normalizedSearch) ||
        publication.languages.some((language) =>
          language.toLowerCase().includes(normalizedSearch),
        )
      );
    });
  }, [search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-1">
          Publications
        </h1>
        <p className="text-muted-foreground">
          Discover publishers and literary organizations
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="input-search-publications"
          type="search"
          placeholder="Search publications..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : !filteredPublications.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No publications found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredPublications.map((pub) => (
            <Link
              key={pub.id}
              href={`/publications/${pub.id}`}
              data-testid={`card-publication-${pub.id}`}
            >
              <div className="border rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer bg-card h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {pub.name}
                    </h3>
                    {pub.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {pub.location}
                      </p>
                    )}
                    {pub.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {pub.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" /> {pub.bookCount} books
                      </span>
                      {pub.languages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="secondary"
                          className="text-xs"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center mt-6">
        Showing {filteredPublications.length} of {samplePublications.length}{" "}
        publications
      </p>
    </div>
  );
}
