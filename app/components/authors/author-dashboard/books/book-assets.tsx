import Link from "next/link";
import { useAuthorBooksContext } from "@/app/contexts/books-context";
import { BookAssetField, getAssetActionLabel } from "./shared";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Upload, Trash2 } from "lucide-react";

function AssetField({
  accept,
  field,
  helper,
  title,
}: {
  accept?: string;
  field: BookAssetField;
  helper?: string;
  title: string;
}) {
  const { assetFileNames, clearAsset, form, handleAssetFileUpload, isSaving } =
    useAuthorBooksContext();

  const value = form[field];
  const pendingName = assetFileNames[field];

  return (
    <div className="space-y-3 rounded-2xl border bg-background p-4">
      <div className="space-y-1">
        <Label htmlFor={`book-asset-${field}`}>{title}</Label>
        {helper && (
          <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
        )}
      </div>
      <Input
        id={`book-asset-${field}`}
        type="file"
        accept={accept}
        disabled={isSaving}
        onChange={(event) => handleAssetFileUpload(field, event)}
      />
      <div className="rounded-xl border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
        {pendingName
          ? `${pendingName} will upload when you save this book.`
          : value
            ? `Stored ${getAssetActionLabel(field)} is attached.`
            : `No ${getAssetActionLabel(field)} added yet.`}
      </div>
      <div className="flex flex-wrap gap-2">
        {value ? (
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={value} target="_blank" rel="noreferrer">
              <Upload className="h-4 w-4" />
              Open current file
            </Link>
          </Button>
        ) : null}
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => clearAsset(field)}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function BookAssets() {
  return (
    <>
      <AssetField field="coverUrl" title="Front cover" accept="image/*" />
      <AssetField field="backCoverUrl" title="Back cover" accept="image/*" />
      <div className="md:col-span-2">
        <AssetField
          field="contentUrl"
          title="Book file"
          helper="Upload a PDF if free ebook is selected."
          accept=".pdf,.epub,.mobi,.doc,.docx,application/pdf"
        />
      </div>
    </>
  );
}
