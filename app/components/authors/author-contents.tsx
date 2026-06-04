import { TabsContent } from "../ui/tabs";
import { AuthorBlogsTab } from "./author-dashboard/blogs";
import { AuthorBooksTab } from "./author-dashboard/books";
import { AuthorEventsTab } from "./author-dashboard/events";
import AboutAuthor from "./profile/about";
import AuthorAwards from "./profile/awards";
import AuthorSocialLinks from "./profile/social-links";

export default function AuthorContents({
  value,
  canEdit,
  profile,
}: {
  value: string;
  canEdit: boolean;
  profile?: any;
}) {
  const isPublication = profile?.user?.role === "publication";
  return (
    <TabsContent value={value} className="space-y-6">
      {value === "about" ? (
        <AboutAuthor canEdit={canEdit} />
      ) : value === "books" ? (
        <AuthorBooksTab
          canEdit={canEdit}
          authorId={profile.authorId}
          isPublication={isPublication}
        />
      ) : value === "blogs" ? (
        <AuthorBlogsTab canEdit={canEdit} authorId={profile.user.id} />
      ) : value === "social" ? (
        <AuthorSocialLinks canEdit={canEdit} isPublication={isPublication} />
      ) : value === "awards" ? (
        <AuthorAwards canEdit={canEdit} isPublication={isPublication} />
      ) : value === "events" ? (
        <AuthorEventsTab canEdit={canEdit} profileId={profile.user.id} />
      ) : null}
    </TabsContent>
  );
}
