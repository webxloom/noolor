"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Award, Link2, MapPin, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getPublicationsQuery } from "@/lib/db/publications/publications-queries";
import type { PublicationRecord, AuthorSocialLinks } from "@/lib/types/authors";
import Image from "next/image";

function countSocialLinks(links?: AuthorSocialLinks | null) {
  return Object.values(links ?? {}).filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  }).length;
}

type PublicationListItem = PublicationRecord & {
  name: string;
  avatarUrl?: string | null;
};

function mapPublicationToListItem(
  publication: PublicationRecord & {
    profile?: { name?: string | null; avatar_url?: string | null } | null;
  },
): PublicationListItem {
  return {
    ...publication,
    name: publication.profile?.name ?? "Untitled publication",
    avatarUrl: publication.profile?.avatar_url ?? null,
  };
}

export default function Publications() {
  const [publications, setPublications] = useState<PublicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    async function loadPublications() {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await getPublicationsQuery(supabase);

      if (!isMounted) {
        return;
      }

      if (error) {
        setLoadError(error.message);
        setPublications([]);
        setIsLoading(false);
        return;
      }

      setPublications((data ?? []).map(mapPublicationToListItem));
      setIsLoading(false);
    }

    void loadPublications();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPublications = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return publications;
    }

    return publications.filter((publication) => {
      return (
        publication.name.toLowerCase().includes(normalizedSearch) ||
        publication.location?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [debouncedSearch, publications]);

  const activeFilterCount = [debouncedSearch.trim().length > 0].filter(
    Boolean,
  ).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">Publications</h1>
          <p className="text-muted-foreground text-lg">
            Discover publishers and literary organizations on Noolor.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredPublications.length} publication
          {filteredPublications.length === 1 ? "" : "s"}
          {activeFilterCount > 0
            ? ` matched across ${activeFilterCount} active filter${activeFilterCount > 1 ? "s" : ""}`
            : " available"}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 space-y-6 flex-shrink-0">
          <div className="bg-card border rounded-xl p-5 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Search className="h-4 w-4" /> Search
              </h3>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  placeholder="Names or locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-background"
                />
                <Button type="submit" size="icon" variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {debouncedSearch ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearFilters}
              >
                Clear Search
              </Button>
            ) : null}
          </div>
        </aside>

        <div className="flex-1">
          {loadError ? (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {loadError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[280px] rounded-xl" />
              ))}
            </div>
          ) : filteredPublications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPublications.map((publication) => {
                const awardsCount = publication.awards?.length ?? 0;
                const socialLinksCount = countSocialLinks(
                  publication.social_links ?? null,
                );

                return (
                  <Link
                    key={publication.id}
                    href={`/publications/${publication.slug}`}
                    data-testid={`card-publication-${publication.slug}`}
                    className="h-full"
                  >
                    <Card className="group h-full overflow-hidden border-0 shadow-md transition-all hover-elevate">
                      <CardContent className="flex h-full flex-col gap-4 p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Image
                              src={
                                publication.avatarUrl ??
                                "/images/publication-placeholder.png"
                              }
                              alt="Publication"
                              width={24}
                              height={24}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 font-serif text-xl font-semibold leading-tight transition-colors group-hover:text-primary">
                              {publication.name}
                            </h3>

                            {publication.location ? (
                              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{publication.location}</span>
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                          {publication.bio ?? "No bio available."}
                        </p>

                        <div className="mt-auto flex flex-wrap gap-2 pt-2">
                          <Badge
                            variant="secondary"
                            className="rounded-sm px-2 py-1 text-xs font-normal"
                          >
                            <Award className="mr-1 h-3.5 w-3.5" />
                            {awardsCount} award{awardsCount === 1 ? "" : "s"}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="rounded-sm px-2 py-1 text-xs font-normal"
                          >
                            <Link2 className="mr-1 h-3.5 w-3.5" />
                            {socialLinksCount} link
                            {socialLinksCount === 1 ? "" : "s"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card border-dashed">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">
                No publications found
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                We couldn&apos;t find any publications matching your search. Try
                searching by name or location, or clear the filter.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
