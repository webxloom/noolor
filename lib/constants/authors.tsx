// Author dashboard constants and types

import {
  BookMarked,
  BookOpen,
  FileUser,
  PenLine,
  PenSquare,
  Star,
} from "lucide-react";

// Sections / tabs
export const AUTHOR_SECTIONS = [
  {
    value: "overview",
    label: "Overview",
    color: "bg-rose-300",
    icon: FileUser,
  },
  {
    value: "profile",
    label: "Profile",
    color: "bg-amber-300",
    icon: PenLine,
  },
  {
    value: "books",
    label: "Books",
    color: "bg-emerald-300",
    icon: BookOpen,
  },
  {
    value: "blogs",
    label: "Blogs",
    color: "bg-sky-300",
    icon: PenSquare,
  },
  // {
  //   value: "reviews",
  //   label: "Reviews",
  //   color: "bg-fuchsia-300",
  //   icon: Star,
  // },
  // {
  //   value: "groups",
  //   label: "Groups",
  //   color: "bg-orange-300",
  //   icon: Rocket,
  // },
  // {
  //   value: "notifications",
  //   label: "Notifications",
  //   color: "bg-red-300",
  //   icon: Bell,
  // },
];

// Quick stat snapshots
export const SNAPSHOTS = [
  {
    key: "books",
    label: "Books",
    detail: "Titles currently saved for this author",
    icon: BookMarked,
  },
  {
    key: "blogs",
    label: "Blogs",
    detail: "Drafted, scheduled, and published posts",
    icon: PenSquare,
  },
  {
    key: "reviews",
    label: "Reviews",
    detail: "Public author reviews received so far",
    icon: BookOpen,
  },
  {
    key: "rating",
    label: "Average rating",
    detail: "Cached score stored on the author profile",
    icon: Star,
  },
] as const;
