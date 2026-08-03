import type { BookCreate, BookRecord } from "@/lib/db/books/books-queries";
import type { AwardFormItem } from "@/lib/types/authors";

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
  quote: string;
  awards?: AwardFormItem[];
  authorName?: string;
  author_id?: string | null;
  publicationName?: string;
  publication_id?: string | null;
  freePageLimit?: number;
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
    quote: "",
    awards: [],
    authorName: "",
    author_id: null,
    publicationName: "",
    publication_id: null,
    freePageLimit: 0,
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
    quote: book.quote ?? "",
    awards: Array.isArray(book.awards)
      ? book.awards.map((a) => ({
          title: a.title ?? "",
          year: a.year != null ? String(a.year) : "",
          fileUrl: a.fileUrl ?? "",
        }))
      : [],
    authorName: book.author_name ?? "",
    author_id: book.author_id ?? null,
    publicationName: book.publication_name ?? "",
    publication_id: book.publication_id ?? null,
    freePageLimit: book.page_limit ?? 0,
  };
}

export function buildBookPayload(
  ownerId: string,
  form: BookFormState,
  isPublication = false,
): BookCreate {
  return {
    // prefer explicit selection from form (author_id/publication_id) when provided
    author_id:
      form.author_id != null ? form.author_id : isPublication ? null : ownerId,
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
    quote: form.quote || null,
    awards:
      form.awards && form.awards.length > 0
        ? form.awards
            .map((a) => ({
              title: a.title.trim(),
              year: a.year?.trim() ? Number(a.year.trim()) : null,
              fileUrl: a.fileUrl || null,
            }))
            .filter((a) => a.title.length > 0)
        : null,
    publication_id:
      form.publication_id != null
        ? form.publication_id
        : isPublication
          ? ownerId
          : null,
    page_limit: form.freePageLimit ?? 0,
    author_name: form.authorName?.trim() || null,
    publication_name: form.publicationName?.trim() || null,
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
