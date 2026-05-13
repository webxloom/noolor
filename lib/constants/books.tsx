import { BookStatus } from "../types/books";

export const BOOK_LANGUAGES = [
  "Tamil",
  "English",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Hindi",
  "Sanskrit",
];

export const BOOK_GENRES = [
  "Fiction",
  "Poetry",
  "History",
  "Biography",
  "Philosophy",
  "Short Stories",
  "Novel",
  "Drama",
  "Children",
  "Non-Fiction",
  "Self-Help",
  "Spirituality",
];

export const STATUS_FILTERS: { value: BookStatus; label: string }[] = [
  { value: "all", label: "All books" },
  { value: "draft", label: "Drafts" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "published", label: "Published" },
  { value: "upcoming", label: "Upcoming" },
];
