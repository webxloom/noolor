type Props = {
  books: any[];
  loading?: boolean;
  onRowClick?: (book: any) => void;
};

const columns = [
  { header: "Title", accessor: "title" },
  { header: "Author", accessor: "author" },
  { header: "Publisher", accessor: "publication" },
  { header: "Language", accessor: "language" },
  { header: "Genre", accessor: "genres" },
  { header: "Accessibility", accessor: "is_free" },
  { header: "Actions", accessor: "actions" },
];

export default function BooksTable({ books, loading, onRowClick }: Props) {
  const renderCell = (book: any, column: string) => {
    switch (column) {
      case "actions":
        return (
          <div className="flex gap-2">
            <button className="text-blue-600 hover:underline">Edit</button>
            <button className="text-red-600 hover:underline">Delete</button>
          </div>
        );
      case "author":
        return book?.author?.profile?.name || book?.author?.name || "-";
      case "publication":
        return (
          book?.publication?.profile?.name || book?.publication?.name || "-"
        );
      case "genres":
        return Array.isArray(book?.genres)
          ? book.genres.join(", ")
          : (book?.genres ?? "-");
      case "is_free":
        return book?.is_free ? "Free" : "Paid";
      default:
        return book[column] ?? "-";
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
              {books.map((u) => (
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
          {books.length === 0 && (
            <div className="py-4 text-sm text-gray-500">No books found.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {books.length} of {books.length} books
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
