export type AuthorProfileUser = {
  avatarUrl?: string;
  id: string;
  language?: string;
  name: string;
};

export type AwardFormItem = {
  fileUrl: string;
  title: string;
  year: string;
};

export type UpcomingWorkFormItem = {
  description: string;
  quote: string;
  title: string;
};

export type SocialLinksForm = {
  facebook: string;
  instagram: string;
  otherLinks: string;
  twitter: string;
  website: string;
  youtube: string;
};

export type AuthorFormState = {
  avatarUrl: string;
  awards: AwardFormItem[];
  bio: string;
  genres: string;
  languages: string;
  location: string;
  name: string;
  socialLinks: SocialLinksForm;
  upcomingWorks: UpcomingWorkFormItem[];
};

export type AuthorAward = {
  title: string;
  year?: number | null;
  fileUrl?: string | null;
};

export type UpcomingWork = {
  title: string;
  description?: string | null;
  quote?: string | null;
};

export type AuthorSocialLinks = {
  facebook?: string | null;
  instagram?: string | null;
  other_links?: string[] | null;
  twitter?: string | null;
  website?: string | null;
  youtube?: string | null;
};

export type AuthorRecord = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  languages?: string[] | null;
  genres?: string[] | null;
  awards?: AuthorAward[] | null;
  upcoming_works?: UpcomingWork[] | null;
  social_links?: AuthorSocialLinks | null;
  rating?: number | null;
  created_at?: string | null;
};
