"use client";
import {
  BookOpen,
  CalendarDays,
  FileText,
  MessageSquareText,
  UserPlus,
} from "lucide-react";

type Activities = {
  newUsers: number;
  booksUploaded: number;
  blogsPublished: number;
  eventsCreated: number;
  reviewsPosted: number;
};

type Props = {
  activities: Activities;
  loading?: boolean;
};

export default function TodayActivityCard({ activities, loading }: Props) {
  const items = [
    {
      title: "New Users",
      value: activities.newUsers,
      icon: UserPlus,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Books Uploaded",
      value: activities.booksUploaded,
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Blogs Published",
      value: activities.blogsPublished,
      icon: FileText,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Events Created",
      value: activities.eventsCreated,
      icon: CalendarDays,
      color: "bg-violet-100 text-violet-600",
    },
    {
      title: "Reviews Posted",
      value: activities.reviewsPosted,
      icon: MessageSquareText,
      color: "bg-rose-100 text-rose-600",
    },
  ];

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Activity
          </h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-lg border p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${item.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {loading ? (
                  <span className="">...</span>
                ) : (
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.title}
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Today
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
