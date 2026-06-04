type Props = {
  events: any[];
  loading?: boolean;
  onRowClick?: (blog: any) => void;
};

const columns = [
  { header: "Title", accessor: "title" },
  { header: "Host", accessor: "host" },
  { header: "Event Type", accessor: "event_type" },
  { header: "Event Mode", accessor: "event_mode" },
  { header: "Venue", accessor: "venue" },
  { header: "Visibility", accessor: "visibility" },
  { header: "Status", accessor: "is_published" },
  { header: "Actions", accessor: "actions" },
];

export default function EventsTable({ events, loading, onRowClick }: Props) {
  const renderCell = (event: any, column: string) => {
    const capitalize = (s?: string) =>
      s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

    switch (column) {
      case "actions":
        return (
          <div className="flex gap-2">
            <button className="text-blue-600 hover:underline">Edit</button>
            <button className="text-red-600 hover:underline">Delete</button>
          </div>
        );

      case "host":
        return event?.host?.profile?.name || event?.host?.name || "-";

      case "language":
        return event?.language ?? "-";

      case "event_type":
        return event?.event_type ?? "-";

      case "event_mode":
        return capitalize(event?.event_mode) ?? "-";

      case "venue": {
        // Prefer venue_name, fall back to meeting_url / city
        const venue =
          `${event?.venue_name}, ${event?.city}` || event?.meeting_url;
        return venue ? venue : (event?.city ?? "-");
      }

      case "visibility":
        return capitalize(event?.visibility) ?? "-";

      case "is_published":
      case "status":
        // Some records use `status` (string) instead of boolean is_published
        if (typeof event?.is_published === "boolean")
          return event.is_published ? "Published" : "Draft";
        return capitalize(event?.status) ?? "-";

      default:
        return event[column] ?? "-";
    }
  };

  return (
    <div className="rounded-lg border p-6 bg-white dark:bg-gray-800">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    className="py-2 font-medium text-gray-700 dark:text-gray-300"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((u) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => onRowClick?.(u)}
                >
                  {columns.map((col) => (
                    <td key={col.accessor} className="py-2">
                      {renderCell(u, col.accessor)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="py-4 text-sm text-gray-500">No events found.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {events.length} of {events.length} events
        </div>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            Previous
          </button>
          <button className="rounded border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
