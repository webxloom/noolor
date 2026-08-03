import Link from "next/link";
import { ChangeEvent } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Upload, Trash2 } from "lucide-react";
import { BookAssetField, BookFormState } from "../shared";

function AssetField({
  accept,
  field,
  helper,
  title,
  form,
  assetFileName,
  handleAssetFileUpload,
  clearAsset,
  isSaving,
}: {
  accept?: string;
  field: BookAssetField;
  helper?: string;
  title: string;
  form: BookFormState;
  assetFileName: string | null;
  handleAssetFileUpload: (
    field: BookAssetField,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  clearAsset: (field: BookAssetField) => void;
  isSaving: boolean;
}) {
  const value = form[field];

  return (
    <div className="space-y-2">
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

      {assetFileName && (
        <p className="text-xs text-muted-foreground">
          Selected: {assetFileName}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {value ? (
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={value} target="_blank" rel="noreferrer">
              <Upload className="h-4 w-4" />
              Open current file
            </Link>
          </Button>
        ) : null}
        {value || assetFileName ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => clearAsset(field)}
            disabled={isSaving}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function BookAssetsForm({
  form,
  assetFileNames,
  handleAssetFileUpload,
  clearAsset,
  isSaving,
}: {
  form: BookFormState;
  assetFileNames: {
    coverUrl: string | null;
    backCoverUrl: string | null;
    contentUrl: string | null;
  };
  handleAssetFileUpload: (
    field: BookAssetField,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  clearAsset: (field: BookAssetField) => void;
  isSaving: boolean;
}) {
  return (
    <div className="bg-muted/5 p-4 rounded-lg border space-y-4">
      <h3 className="mb-4 text-lg font-semibold">Book Images & Files</h3>
      <AssetField
        field="coverUrl"
        title="Front cover"
        accept="image/*"
        form={form}
        assetFileName={assetFileNames.coverUrl}
        handleAssetFileUpload={handleAssetFileUpload}
        clearAsset={clearAsset}
        isSaving={isSaving}
      />
      <AssetField
        field="backCoverUrl"
        title="Back cover"
        accept="image/*"
        form={form}
        assetFileName={assetFileNames.backCoverUrl}
        handleAssetFileUpload={handleAssetFileUpload}
        clearAsset={clearAsset}
        isSaving={isSaving}
      />
      <AssetField
        field="contentUrl"
        title="Book file"
        helper="Upload a PDF if free ebook is selected."
        accept=".pdf,.epub,.mobi,.doc,.docx,application/pdf"
        form={form}
        assetFileName={assetFileNames.contentUrl}
        handleAssetFileUpload={handleAssetFileUpload}
        clearAsset={clearAsset}
        isSaving={isSaving}
      />
    </div>
  );
}
