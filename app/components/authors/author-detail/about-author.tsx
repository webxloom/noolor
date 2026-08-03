import { useState } from "react";
import { splitListValue } from "@/app/hooks/author-profile-utils";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Badge } from "../../ui/badge";

export default function AboutAuthor({ details }: { details: any }) {
  const [expanded, setExpanded] = useState(false);
  const { pen_name, phone, location, bio } = details;

  const languages = splitListValue(details.languages);
  const genres = splitListValue(details.genres);

  return (
    <>
      {/* Pen Name & Phone */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Pen Name
          </h3>
          <p className="text-base">{pen_name || "Not specified"}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Phone
          </h3>
          <p className="text-base">{phone || "Not specified"}</p>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Location
          </h3>
          <div className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            <span>{location || "Not specified"}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Biography
        </h3>
        <p
          className={`text-base leading-8 text-foreground/80 whitespace-pre-line transition-all duration-300 ${
            !expanded && "line-clamp-5"
          }`}
        >
          {bio ||
            "No biography has been added yet. Readers will soon discover their literary journey and inspirations here."}
        </p>

        {bio.length > 250 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {expanded ? (
              <>
                Read less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Read more
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Languages & Genres */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {languages.length > 0 ? (
              languages.map((language) => (
                <Badge
                  key={language}
                  className="rounded-full bg-primary/10 text-primary border-0 px-3 py-1"
                >
                  {language}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No languages specified
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.length > 0 ? (
              genres.map((genre) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className="rounded-full px-3 py-1 bg-primary/10 text-primary border-0"
                >
                  {genre}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No genres specified
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
