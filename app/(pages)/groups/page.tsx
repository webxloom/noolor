"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Users, Plus, Lock } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { sampleGroups } from "@/lib/sample-groups";

const isLoading = false;

export default function Groups() {
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return sampleGroups;
    }

    return sampleGroups.filter((group) => {
      return (
        group.name.toLowerCase().includes(normalizedSearch) ||
        group.description?.toLowerCase().includes(normalizedSearch) ||
        group.creatorName.toLowerCase().includes(normalizedSearch) ||
        group.language?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-1">
            Groups
          </h1>
          <p className="text-muted-foreground">
            Connect with fellow readers and writers
          </p>
        </div>
        <Link href="/groups/new">
          <Button data-testid="button-create-group" className="gap-2">
            <Plus className="h-4 w-4" /> Create Group
          </Button>
        </Link>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="input-search-groups"
          type="search"
          placeholder="Search groups..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : !filteredGroups.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No groups yet</p>
          <p className="text-sm mt-2">
            Start a community for writers and readers
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              data-testid={`card-group-${group.id}`}
            >
              <div className="border rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition-all bg-card cursor-pointer h-full">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">
                    {group.name}
                  </h3>
                  {group.isPrivate && (
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {group.memberCount} members
                  </span>
                  {group.language && (
                    <Badge variant="secondary" className="text-xs">
                      {group.language}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    by {group.creatorName}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center mt-6">
        Showing {filteredGroups.length} of {sampleGroups.length} groups
      </p>
    </div>
  );
}
