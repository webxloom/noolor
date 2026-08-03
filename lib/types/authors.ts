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

export type ProfileFormState = {
  name: string;
  phone: string;
  username: string;
  contact_email: string;
  subscription_plan: string;
};

export type AuthorFormState = {
  avatar_url?: string;
  phone?: string;
  pen_name: string;
  slug?: string;
  awards?: AwardFormItem[];
  bio: string;
  genres: string;
  languages: string;
  location: string;
  socialLinks?: SocialLinksForm;
  is_verified: boolean;
  is_active: boolean;
};

export type PublicationFormState = {
  slug?: string;
  publication_name: string;
  phone?: string;
  avatar_url?: string;
  awards?: AwardFormItem[];
  bio: string;
  location: string;
  socialLinks?: SocialLinksForm;
  is_verified: boolean;
  is_active: boolean;
};

export type AuthorAward = {
  title: string;
  year?: number | null;
  fileUrl?: string | null;
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
  profile_id: string;
  pen_name?: string;
  slug: string;
  bio?: string | null;
  author_avatar_url?: string | null;
  phone_number?: string | null;
  location?: string | null;
  languages?: string[] | null;
  genres?: string[] | null;
  awards?: AuthorAward[] | null;
  social_links?: AuthorSocialLinks | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicationRecord = {
  id: string;
  profile_id: string;
  slug: string;
  publication_name?: string;
  phone_number?: string | null;
  publication_avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  awards?: AuthorAward[] | null;
  social_links?: AuthorSocialLinks | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
