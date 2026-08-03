import { MapPin } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

export default function AboutForm({
  form,
  onCancel,
  saveProfile,
  isSaving,
  setField,
}: {
  form: any;
  onCancel: () => void;
  saveProfile: () => Promise<void>;
  isSaving: boolean;
  setField: (field: string, value: any) => void;
}) {
  const { publication_name, phone, location, bio } = form;

  return (
    <div className="px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6 pb-4">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="author-penname" className="text-sm sm:text-base">
            Publication Name
          </Label>
          <Input
            id="author-publicationname"
            value={publication_name ?? ""}
            onChange={(event) =>
              setField("publication_name", event.target.value as never)
            }
            placeholder="Publication pen name"
            className="text-sm sm:text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author-phone" className="text-sm sm:text-base">
            Phone
          </Label>
          <Input
            id="author-phone"
            value={phone}
            onChange={(event) => setField("phone", event.target.value)}
            placeholder="Publication phone number"
            className="text-sm sm:text-base"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="author-location" className="text-sm sm:text-base">
            Location
          </Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="author-location"
              className="pl-10 text-sm sm:text-base"
              value={location}
              onChange={(event) => setField("location", event.target.value)}
              placeholder="City, state, country"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="author-bio" className="text-sm sm:text-base">
          Bio
        </Label>
        <Textarea
          id="author-bio"
          value={bio}
          onChange={(event) => setField("bio", event.target.value)}
          placeholder="Write a concise author bio"
          className="text-sm sm:text-base min-h-[120px] sm:min-h-[150px]"
          rows={6}
        />
      </div>

      {/*  Save Button */}
      <div className="flex justify-end gap-2 sm:gap-3 pt-2">
        <Button
          type="button"
          variant="default"
          className="text-sm sm:text-base"
          onClick={async () => {
            try {
              await saveProfile();
              onCancel();
            } catch (err) {
              // saveProfile handles toasts
            }
          }}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
