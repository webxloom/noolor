type Props = {
  invites: any[];
  loading?: boolean;
  onRowClick?: (invite: any, action: string) => void;
};

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Phone", accessor: "phone" },
  { header: "Email", accessor: "email" },
  { header: "Role", accessor: "role" },
  { header: "Verification Status", accessor: "verification_status" },
  { header: "Invitation Status", accessor: "invitation_status" },
  { header: "Has Registered", accessor: "register_status" },
  { header: "Created By", accessor: "creator" },
  { header: "Actions", accessor: "actions" },
];

export default function InvitesTable({ invites, loading, onRowClick }: Props) {
  const renderCell = (invite: any, column: string) => {
    const capitalize = (s?: string) =>
      s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

    switch (column) {
      case "actions":
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRowClick?.(invite, "edit");
              }}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRowClick?.(invite, "invite");
              }}
              className="text-green-600 hover:underline"
            >
              {invite.is_invited ? "Resend Invite" : "Send Invite"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRowClick?.(invite, "delete");
              }}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        );
      case "creator":
        return capitalize(invite.creator?.role) ?? "-";
      case "role":
        return capitalize(invite.role) ?? "-";
      case "verification_status":
        return invite.is_verified ? (
          <span className="text-green-600">Verified</span>
        ) : (
          <span className="text-red-600">Unverified</span>
        );
      case "invitation_status":
        return invite.is_invited ? (
          <span className="text-green-600">Invited</span>
        ) : (
          <span className="text-red-600">Not Invited</span>
        );
      case "register_status":
        return invite.is_registered ? (
          <span className="text-green-600">Registered</span>
        ) : (
          <span className="text-red-600">Pending</span>
        );
      default:
        return invite[column] ?? "-";
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
              {invites.map((u) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => onRowClick?.(u, "view")}
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
          {invites.length === 0 && (
            <div className="py-4 text-sm text-gray-500">No invites found.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {invites.length} of {invites.length} invites
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
