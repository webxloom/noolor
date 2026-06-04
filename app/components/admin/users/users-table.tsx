type Props = {
  users: any[];
  loading?: boolean;
  onRowClick?: (user: any) => void;
};

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Username", accessor: "username" },
  { header: "Phone", accessor: "phone" },
  { header: "Email", accessor: "contact_email" },
  { header: "Role", accessor: "role" },
  { header: "Status", accessor: "is_active" },
  { header: "Registered", accessor: "created_at" },
  { header: "Actions", accessor: "actions" },
];

export default function UsersTable({ users, loading, onRowClick }: Props) {
  const renderCell = (user: any, column: string) => {
    switch (column) {
      case "role":
        return user.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : "-";
      case "is_active":
        return user.is_active ? "Active" : "Inactive";
      case "created_at":
        return user.created_at
          ? new Date(user.created_at).toLocaleString()
          : "-";
      case "actions":
        return (
          <div className="flex gap-2">
            <button className="text-blue-600 hover:underline">Edit</button>
            <button className="text-red-600 hover:underline">Delete</button>
          </div>
        );
      default:
        return user[column] ?? "-";
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
              {users.map((u) => (
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
          {users.length === 0 && (
            <div className="py-4 text-sm text-gray-500">No users found.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {users.length} of {users.length} users
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
