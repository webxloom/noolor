import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: "image" | "pdf" | "any";
  label?: string;
  className?: string;
  preview?: "image" | "none";
}

const ACCEPT_MAP = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  pdf: "application/pdf",
  any: "image/jpeg,image/png,image/webp,image/gif,application/pdf",
};

const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  pdf: ["application/pdf"],
  any: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "application/pdf"],
};

export function FileUpload({
  value,
  onChange,
  accept = "image",
  label,
  className = "",
  preview = "image",
}: FileUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isImage = value && accept !== "pdf" && (
    value.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) || value.includes("/uploads/")
  );

  async function handleFile(file: File) {
    if (!ALLOWED_TYPES[accept].includes(file.type)) {
      toast({
        title: `Invalid file type`,
        description: accept === "image" ? "Please upload an image (JPEG, PNG, WebP, GIF)" : "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      const data = await res.json();
      onChange(data.url);
      toast({ title: "File uploaded successfully" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function clear() {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_MAP[accept]}
        className="hidden"
        onChange={handleChange}
      />

      {value ? (
        <div className="relative inline-block">
          {preview === "image" && isImage ? (
            <div className="relative">
              <img
                src={value}
                alt="Uploaded"
                className="max-h-40 max-w-full rounded-lg border object-contain"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={clear}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
              {accept === "pdf" ? <FileText className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-primary" />}
              <span className="text-sm truncate max-w-[200px]">{value.split("/").pop()}</span>
              <button type="button" onClick={clear} className="ml-1 text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full gap-2"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Replace file"}
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {uploading ? "Uploading..." : (label ?? "Click or drag & drop to upload")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {accept === "image" && "JPEG, PNG, WebP, GIF — max 50MB"}
              {accept === "pdf" && "PDF — max 50MB"}
              {accept === "any" && "JPEG, PNG, WebP, GIF, PDF — max 50MB"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
