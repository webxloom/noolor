import { useMemo } from "react";
import { Search, Filter } from "lucide-react";

// Components
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { EventListItem } from "@/app/(pages)/events/page";

export default function EventsSearch({
  handleSearchSubmit,
  handleClearFilters,
  filters,
  setFilters,
  events,
}: {
  handleSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleClearFilters: () => void;
  filters: {
    search: string;
    debouncedSearch: string;
    author: string;
    language: string;
    tag: string;
    dateRange: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      search: string;
      debouncedSearch: string;
      author: string;
      language: string;
      tag: string;
      dateRange: string;
    }>
  >;
  events: EventListItem[];
}) {
  const { search, debouncedSearch, author, language, tag, dateRange } = filters;

  const authorOptions = useMemo(() => {
    return Array.from(
      new Map(
        events
          .filter((event) => event.authorId && event.authorName)
          .map((event) => [
            event.authorId as string,
            event.authorName as string,
          ]),
      ),
    ).sort((left, right) => left[1].localeCompare(right[1]));
  }, [events]);

  return (
    <aside className="w-full flex-shrink-0 space-y-6 lg:w-72">
      <div className="space-y-6 rounded-xl border bg-card p-5">
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Search className="h-4 w-4" /> Search
          </h3>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder="Titles, authors, tags..."
              value={search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value }))
              }
              className="bg-background"
            />
            <Button type="submit" size="icon" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Filter className="h-4 w-4" /> Filters
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Author</label>
              <Select
                value={author}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, author: value }))
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authorOptions.map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Published</label>
              <Select
                value={dateRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, dateRange: value }))
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-year">Last year</SelectItem>
                  <SelectItem value="older">Older</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {(debouncedSearch ||
          author !== "all" ||
          language !== "all" ||
          tag !== "all" ||
          dateRange !== "all") && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </aside>
  );
}
