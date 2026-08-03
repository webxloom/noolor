"use client";
import Link from "next/link";
import ReaderLibrary from "@/app/components/readers/reader-library";
import { useProfileSession } from "@/app/hooks/use-profile-session";

export default function ReaderPage() {
  const { profileUser } = useProfileSession();
  const userId = profileUser?.id;

  return (
    <div className="flex flex-col gap-4">
      <Link href="/dashboard" className="text-sm text-blue-500 hover:underline">
        &larr; Back to Dashboard
      </Link>
      <ReaderLibrary userId={userId ?? ""} />
    </div>
  );
}
