import { useState } from "react";
import type { MouseEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/app/components/ui/button";

export default function EventsListView({
  events,
  onEdit,
  canEdit,
}: {
  events: any[];
  onEdit: (actionType: string, eventId?: string) => void;
  canEdit: boolean;
}) {
  const ITEMS_PER_PAGE = 9;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);

  const paginatedEvents = events.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No events added yet.{" "}
          {canEdit ? "Click the button above to add your first event." : ""}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedEvents.map((event) => {
              return (
                <div
                  key={event.id}
                  className="group relative overflow-hidden rounded-xl border shadow-sm aspect-[3/3.4] w-full"
                >
                  <Image
                    src={event.cover_image || "/images/event-placeholder.png"}
                    alt={event.title ?? "event cover"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />

                  {/* Overlay on image to navigate to book detail page (visible on hover) */}
                  <Link
                    href={`/events/${event.slug}`}
                    className="absolute inset-0 z-20 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                  >
                    <div className="rounded-md bg-black/60 px-3 py-2 text-sm font-medium text-white pointer-events-auto">
                      View event details
                    </div>
                  </Link>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 rounded-full bg-white px-3 py-1 shadow-lg ring-1 ring-black/10">
                    <span className="text-xs font-semibold text-gray-900">
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between bg-black/60 p-2 backdrop-blur-sm">
                    <h3 className="line-clamp-1 text-sm font-medium text-white">
                      {event.title}
                    </h3>

                    {canEdit && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onEdit("edit", event.id);
                          }}
                        >
                          <Pencil className="h-4 w-4 text-white" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onEdit("delete", event.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
