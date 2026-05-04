import type { BookInsert, BookRecord } from "@/lib/db/books/books-queries";

export type WriterBooksTabProps = {
  user: {
    id: string;
    name: string;
  };
};

export type BookStatus =
  | "all"
  | "draft"
  | "free"
  | "paid"
  | "published"
  | "upcoming";

export type BookFormState = {
  title: string;
  language: string;
  genre: string;
  description: string;
  isFree: boolean;
  price: string;
  pageCount: string;
  publishedYear: string;
  coverUrl: string;
  backCoverUrl: string;
  contentUrl: string;
  quotes: string[];
};

export type BookAssetField = "coverUrl" | "backCoverUrl" | "contentUrl";

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

export function buildEmptyBookForm(): BookFormState {
  return {
    title: "",
    language: "Tamil",
    genre: "Fiction",
    description: "",
    isFree: false,
    price: "",
    pageCount: "",
    publishedYear: "",
    coverUrl: "",
    backCoverUrl: "",
    contentUrl: "",
    quotes: [],
  };
}

export function mapBookToForm(book: BookRecord): BookFormState {
  return {
    title: book.title ?? "",
    language: book.language ?? "Tamil",
    genre: book.genres?.[0] ?? "Fiction",
    description: book.description ?? "",
    isFree: Boolean(book.is_free),
    price: book.price ? String(book.price) : "",
    pageCount: book.page_count ? String(book.page_count) : "",
    publishedYear: book.published_year ? String(book.published_year) : "",
    coverUrl: book.cover_url ?? "",
    backCoverUrl: book.back_cover_url ?? "",
    contentUrl: book.content_url ?? "",
    quotes: Array.isArray(book.quotes) ? book.quotes : [],
  };
}

export function buildBookPayload(
  authorId: string,
  form: BookFormState,
): BookInsert {
  return {
    author_id: authorId,
    title: form.title.trim(),
    language: form.language,
    genres: form.genre ? [form.genre] : [],
    description: form.description.trim() || null,
    is_free: form.isFree,
    price: form.isFree ? null : form.price ? Number(form.price) : null,
    page_count: form.pageCount ? Number(form.pageCount) : null,
    published_year: form.publishedYear ? Number(form.publishedYear) : null,
    cover_url: form.coverUrl.trim() || null,
    back_cover_url: form.backCoverUrl.trim() || null,
    content_url: form.contentUrl.trim() || null,
    quotes: form.quotes.length > 0 ? form.quotes : null,
    publication_id: null,
  };
}

export function getBookStatus(book: BookRecord): Exclude<BookStatus, "all"> {
  const currentYear = new Date().getFullYear();
  const hasCoreMetadata = Boolean(
    book.cover_url && book.description && book.published_year,
  );

  if (!hasCoreMetadata) {
    return "draft";
  }

  if (book.published_year && book.published_year > currentYear) {
    return "upcoming";
  }

  if (book.is_free) {
    return "free";
  }

  if (book.price && book.price > 0) {
    return "paid";
  }

  return "published";
}

export function getStatusBadgeVariant(
  status: Exclude<BookStatus, "all">,
): "secondary" | "default" | "outline" {
  if (status === "draft") return "outline";
  if (status === "free") return "secondary";
  return "default";
}

export function matchesBookSearch(book: BookRecord, search: string) {
  const haystack = [
    book.title,
    book.language,
    book.description,
    book.genres?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

export function getAssetActionLabel(field: BookAssetField) {
  if (field === "coverUrl") {
    return "cover image";
  }

  if (field === "backCoverUrl") {
    return "back cover image";
  }

  return "book file";
}
