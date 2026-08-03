import { useEffect, useState } from "react";
import { updateAuthorQuery } from "@/lib/db/authors/authors-queries";
import { checkRolehasBooks } from "@/lib/db/books/books-queries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { capitalizeFirstLetter } from "@/lib/utils";
import { updatePublicationQuery } from "@/lib/db/publications/publications-queries";

export default function RoleCompletionCriteria({
  roleId,
  role,
  bioStatus,
  isActive = false,
}: {
  roleId: string | null;
  role: string;
  bioStatus: boolean;
  isActive: boolean;
}) {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const isAuthor = role === "author";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    if (roleId) {
      checkRolehasBooks(roleId)
        .then(async (hasBooks) => {
          if (!mounted) return;
          if (hasBooks && bioStatus) {
            setCompletionPercentage(100);
            isAuthor
              ? await updateAuthorQuery(supabase, roleId, { is_active: true })
              : await updatePublicationQuery(supabase, roleId, {
                  is_active: true,
                });
          } else {
            bioStatus
              ? setCompletionPercentage(50)
              : setCompletionPercentage(10);
            isAuthor
              ? await updateAuthorQuery(supabase, roleId, { is_active: false })
              : await updatePublicationQuery(supabase, roleId, {
                  is_active: false,
                });
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
      isActive ? setCompletionPercentage(100) : setCompletionPercentage(0);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [roleId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {capitalizeFirstLetter(role)} Completion Progress
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
            {capitalizeFirstLetter(role)} Dashboard
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-4 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {capitalizeFirstLetter(role)} Completion Progress
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete your bio and add atleast one book to get listed in the{" "}
          {capitalizeFirstLetter(role)}s directory and be eligible for more
          features.
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
