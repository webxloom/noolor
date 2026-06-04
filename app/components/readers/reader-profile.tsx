"use client";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useReaderProfileContext } from "@/app/contexts/reader-context";

export default function ReaderProfile({ canEdit }: { canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const { form, setField, saveProfile, isSaving, user } =
    useReaderProfileContext();

  return (
    <div className="px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6 pb-4">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="author-name" className="text-sm sm:text-base">
            Name
          </Label>
          <Input
            id="author-name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Author display name"
            className="text-sm sm:text-base"
            required
            readOnly={!isEditing}
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="author-username" className="text-sm sm:text-base">
            Username
          </Label>
          <Input
            id="author-username"
            value={form.username}
            onChange={(event) => setField("username", event.target.value)}
            placeholder="Author user name"
            className="text-sm sm:text-base"
            required
            readOnly={!isEditing}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="author-phone" className="text-sm sm:text-base">
            Phone
          </Label>
          <Input
            id="author-phone"
            value={form.phone}
            onChange={(event) => setField("phone", event.target.value)}
            placeholder="Author phone number"
            className="text-sm sm:text-base"
            required
            readOnly={!isEditing}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="author-email" className="text-sm sm:text-base">
            Email
          </Label>
          <Input
            id="author-email"
            value={form.contact_email}
            onChange={(event) => setField("contact_email", event.target.value)}
            placeholder="Author contact email"
            className="text-sm sm:text-base"
            readOnly={!isEditing}
          />
        </div>
      </div>

      {/* Cancel & Save Button */}
      {canEdit && isEditing ? (
        <div className="flex flex-row items-center justify-end gap-2 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full text-sm sm:text-base"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            className="w-full text-sm sm:text-base"
            onClick={async () => {
              try {
                await saveProfile();
                setIsEditing(false);
              } catch (err) {
                // saveProfile handles toasts
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      ) : (
        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="gap-2 text-sm sm:text-base"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
