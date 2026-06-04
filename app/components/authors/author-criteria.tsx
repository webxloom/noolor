import { checkAuthorhasBooks } from "@/lib/db/books/books-queries";
import { useEffect, useState } from "react";

export default function AuthorCriteria({
  authorId,
  isPublication,
}: {
  authorId: string | null;
  isPublication: boolean;
}) {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    if (authorId) {
      checkAuthorhasBooks(authorId)
        .then((hasBooks) => {
          if (!mounted) return;
          if (hasBooks) {
            setCompletionPercentage(100);
          } else {
            setCompletionPercentage(50);
          }
        })
        .catch(() => {
          if (!mounted) return;
          setCompletionPercentage(0);
        })
        .finally(() => {
          if (!mounted) return;
          setLoading(false);
        });
    } else {
      setCompletionPercentage(0);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [authorId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isPublication ? "Publication" : "Writer"} Completion Progress
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <svg
            className="animate-spin h-5 w-5 text-gray-600 dark:text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span>Calculating completion...</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded-full w-1/4" />
        </div>
      </div>
    );
  }

  if (completionPercentage === 100) {
    return (
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isPublication ? "Publication" : "Writer"} Dashboard
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-4 mb-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isPublication ? "Publication" : "Writer"} Completion Progress
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete your bio and add atleast one book to get listed in the{" "}
          {isPublication ? "publications " : "authors "}
          directory and be eligible for more features.
        </p>
      </div>
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 left-2">
        {completionPercentage}% Complete
      </p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative flex items-center">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center"
          style={{ width: completionPercentage + "%" }}
        ></div>
      </div>
    </div>
  );
}
