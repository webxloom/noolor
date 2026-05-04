import type { BlogStatus } from "../types/blogs";

export const BLOG_LANGUAGES = [
  "Tamil",
  "English",
  "Malayalam",
  "Kannada",
  "Hindi",
  "Telugu",
  "Sanskrit",
];

export const BLOG_STATUS_FILTERS: { value: BlogStatus; label: string }[] = [
  { value: "all", label: "All blogs" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "scheduled", label: "Scheduled" },
];
