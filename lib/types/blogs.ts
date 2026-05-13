export type AuthorBlogsTabProps = {
  user: {
    id: string;
    name: string;
  };
};

export type BlogStatus = "all" | "draft" | "published" | "scheduled";

export type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  language: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
};
