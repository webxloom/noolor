import { TabsContent } from "../ui/tabs";
import ReaderLibrary from "./reader-library";
import ReaderProfile from "./reader-profile";

export default function ReaderContents({
  value,
  canEdit,
  profile,
}: {
  value: string;
  canEdit: boolean;
  profile?: any;
}) {
  return (
    <TabsContent value={value} className="space-y-6">
      {value === "about" ? (
        <ReaderProfile canEdit={canEdit} />
      ) : value === "library" ? (
        <ReaderLibrary userId={profile.user.id} />
      ) : null}
    </TabsContent>
  );
}
