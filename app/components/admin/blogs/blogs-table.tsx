type Props = {
  blogs: any[];
  loading?: boolean;
  onRowClick?: (blog: any) => void;
};

const columns = [
  { header: "Title", accessor: "title" },
  { header: "Author", accessor: "author" },
  { header: "Language", accessor: "language" },
  { header: "Status", accessor: "is_published" },
  { header: "Actions", accessor: "actions" },
];

export default function BlogsTable({ blogs, loading, onRowClick }: Props) {
  const renderCell = (blog: any, column: string) => {
    switch (column) {
      case "actions":
        return (
          <div className="flex gap-2">
            <button className="text-blue-600 hover:underline">Edit</button>
            <button className="text-red-600 hover:underline">Delete</button>
          </div>
        );
      case "author":
        return blog?.author?.profile?.name || blog?.author?.name || "-";
      case "is_published":
        return blog?.is_published ? "Published" : "Draft";
      default:
        return blog[column] ?? "-";
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
              {blogs.map((u) => (
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
          {blogs.length === 0 && (
            <div className="py-4 text-sm text-gray-500">No blogs found.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {blogs.length} of {blogs.length} blogs
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
