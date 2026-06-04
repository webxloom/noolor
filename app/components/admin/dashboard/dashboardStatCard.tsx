type Props = {
  counts: {
    users: {
      total: number;
      reader: number;
      author: number;
      publisher: number;
    };
    books: { total: number; author: number; publisher: number };
    blogs: { total: number };
    events: { total: number };
    reviews: { total: number };
  };
  loading?: boolean;
};

type StatItem = {
  title: string;
  total: number;
  details?: {
    label: string;
    value: number;
  }[];
};

export default function DashboardStatCard({ counts, loading }: Props) {
  const items: StatItem[] = [
    {
      title: "Users",
      total: counts.users.total,
      details: [
        { label: "Readers", value: counts.users.reader },
        { label: "Authors", value: counts.users.author },
        { label: "Publishers", value: counts.users.publisher },
      ],
    },
    {
      title: "Books",
      total: counts.books.total,
      details: [
        { label: "Authors", value: counts.books.author },
        { label: "Publishers", value: counts.books.publisher },
      ],
    },
    {
      title: "Blogs",
      total: counts.blogs.total,
    },
    {
      title: "Events",
      total: counts.events.total,
    },
    {
      title: "Reviews",
      total: counts.reviews.total,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {item.title}
              </p>

              {loading ? (
                <span className="">...</span>
              ) : (
                <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {item.total}
                </h2>
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-5 border-t pt-4">
            <div className="space-y-2">
              {item.details?.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {detail.label}
                  </span>

                  {loading ? (
                    <span className="">...</span>
                  ) : (
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {detail.value.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
