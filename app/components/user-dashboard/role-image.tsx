import React, { useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/app/contexts/toast-context";
import {
  authorImageFolder,
  publicationsImageFolder,
} from "@/app/hooks/author-profile-utils";
import { uploadRoleImageQuery } from "@/lib/db/user-roles/queries";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "jpg") : "jpg";
}

export default function RoleImage({
  image,
  canEdit = false,
  roleId,
  role,
}: {
  image?: string;
  canEdit?: boolean;
  roleId: string | null;
  role: string;
}) {
  const { addToast } = useToast();
  const [imageUrl, setImageUrl] = React.useState(image);
  const [uploading, setUploading] = React.useState(false);

  useEffect(() => {
    setImageUrl(image);
  }, [image]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      // Resize the image to portrait dimensions to fit the container
      let fileToUpload = file;
      try {
        fileToUpload = await resizeImageToPortrait(file, 375, 612);
      } catch (err) {
        // if resizing fails, fall back to original file
        // eslint-disable-next-line no-console
        console.warn("Image resize failed, uploading original:", err);
        fileToUpload = file;
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      const version = Date.now().toString().slice(-6);
      const folder =
        role === "publication" ? publicationsImageFolder : authorImageFolder;
      const filenamePrefix = `${folder}/avatar_${roleId}_${version}.${getFileExtension(file.name)}`;

      const response = await uploadRoleImageQuery(
        roleId || "",
        role,
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

  async function resizeImageToPortrait(
    file: File,
    targetWidth = 600,
    targetHeight = 900,
  ): Promise<File> {
    const image = await createImageBitmap(file);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // Fit the image inside the target (contain) and pad remaining space
    const iw = image.width;
    const ih = image.height;
    const scale = Math.min(targetWidth / iw, targetHeight / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const dx = (targetWidth - sw) / 2;
    const dy = (targetHeight - sh) / 2;

    // Fill background with white to avoid transparent/black bars
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.drawImage(image, dx, dy, sw, sh);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to create blob"));
          const ext = getFileExtension(file.name) || "webp";
          const newFile = new File([blob], `resized.${ext}`, {
            type: blob.type || file.type || "image/webp",
          });
          resolve(newFile);
        },
        "image/webp",
        0.9,
      );
    });
  }

  return (
    <div className="group relative w-full overflow-hidden rounded-lg">
      {uploading ? (
        <div className="w-[375px] h-[612px] relative bg-muted">
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <span className="text-white text-sm">Uploading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="w-[375px] h-[612px] relative bg-muted border border-primary/50 shadow-sm rounded-lg overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${role} image`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full rounded-lg">
                <span className="text-sm text-muted-foreground">
                  No image available
                </span>
              </div>
            )}
          </div>

          {canEdit && (
            <label className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/80 hover:bg-white/90 text-sm text-gray-800 rounded-md px-3 py-1 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer">
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
