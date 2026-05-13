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
