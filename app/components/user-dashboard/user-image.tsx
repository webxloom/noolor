import React from "react";
import Image from "next/image";
import { useToast } from "@/app/contexts/toast-context";
import { uploadProfileImageQuery } from "@/lib/db/profiles/profile-queries";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "jpg") : "jpg";
}

export default function UserImage({
  image,
  canEdit = false,
  profileId,
}: {
  image?: string;
  canEdit?: boolean;
  profileId: string;
}) {
  const { addToast } = useToast();
  const [imageUrl, setImageUrl] = React.useState(image);
  const [uploading, setUploading] = React.useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      let fileToUpload = file;

      const formData = new FormData();
      formData.append("file", fileToUpload);
      const version = Date.now().toString().slice(-6);
      const folder = "user-images";
      const filenamePrefix = `${folder}/avatar_${profileId}_${version}.${getFileExtension(file.name)}`;

      const response = await uploadProfileImageQuery(
        profileId,
        fileToUpload,
        filenamePrefix,
      );

      if (response?.error) {
        throw new Error("Failed to upload image");
      }

      // Refresh the image URL to reflect the new upload and bust cache
      const newImageUrl = response?.url ?? undefined;
      setImageUrl(newImageUrl);
    } catch {
      addToast("Failed to upload image. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 overflow-hidden p-4 border-b border-border/70">
      {uploading ? (
        <div className="w-64 h-64 relative bg-muted rounded-full">
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
            <span className="text-white text-xs">Uploading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-64 h-64 bg-muted rounded-full overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="User Avatar"
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-muted-foreground text-center px-2">
                  No image
                </span>
              </div>
            )}
          </div>

          {canEdit && (
            <label className="mt-2 inline-flex items-center gap-2 bg-secondary/80 hover:bg-secondary/90 text-xs text-gray-800 rounded-md px-3 py-2 backdrop-blur-sm transition-opacity cursor-pointer">
              Upload new image
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageChange}
              />
            </label>
          )}
        </>
      )}
    </div>
  );
}
