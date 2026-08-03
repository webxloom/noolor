import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";

export default function AboutPublication({ details }: { details: any }) {
  const [expanded, setExpanded] = useState(false);
  const { publication_name, phone, location, bio } = details;

  return (
    <>
      {/* Publication Name & Phone */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Publication Name
          </h3>
          <p className="text-base">{publication_name || "Not specified"}</p>
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
    </>
  );
}
