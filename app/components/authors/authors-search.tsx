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
import { AuthorListItem } from "@/app/(pages)/authors/page";

export default function AuthorsSearch({
  handleSearchSubmit,
  handleClearFilters,
  authors,
  filters,
  setFilters,
}: {
  handleSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleClearFilters: () => void;
  authors: AuthorListItem[];
  filters: {
    search: string;
    debouncedSearch: string;
    language: string;
    genre: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      search: string;
      debouncedSearch: string;
      language: string;
      genre: string;
    }>
  >;
}) {
  const { search, debouncedSearch, language, genre } = filters;

  const languageOptions = useMemo(() => {
    return Array.from(
      new Set(authors.flatMap((author) => author.languages)),
    ).sort((left, right) => left.localeCompare(right));
  }, [authors]);

  const genreOptions = useMemo(() => {
    return Array.from(new Set(authors.flatMap((author) => author.genres))).sort(
      (left, right) => left.localeCompare(right),
    );
  }, [authors]);

  return (
    <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
      <div className="bg-card border rounded-xl p-5 space-y-6">
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" /> Search
          </h3>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder="Names..."
              value={search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="bg-background"
            />
            <Button type="submit" size="icon" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select
                value={language}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languageOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Genre</label>
              <Select
                value={genre}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, genre: value }))
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genreOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {(debouncedSearch || language !== "all" || genre !== "all") && (
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
