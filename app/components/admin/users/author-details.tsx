"use client";

import * as React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import { AuthorRecord } from "@/lib/types/authors";
import { GENRES, LANGUAGES } from "@/lib/constants/common";
import SocialLinks from "./social-links";
import Awards from "./awards";

const formDetails: any = {
  pen_name: { label: "Pen Name", type: "text" },
  slug: { label: "Slug", type: "text" },
  location: { label: "Location", type: "text" },
  bio: { label: "Bio", type: "text" },
  languages: {
    label: "Languages",
    type: "select",
    options: LANGUAGES,
  },
  genres: { label: "Genres", type: "select", options: GENRES },
};

export default function AuthorDetail({
  author,
  isPublication,
  onSave,
}: {
  author: AuthorRecord;
  isPublication?: boolean;
  onSave?: (updated: Partial<AuthorRecord>) => Promise<void> | void;
}) {
  const [form, setForm] = React.useState<Partial<AuthorRecord>>({
    pen_name: "",
    slug: "",
    location: "",
    bio: "",
    languages: null,
    genres: null,
    awards: null,
    social_links: null,
  });
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!author) return;
    setForm((f) => ({ ...f, ...author }));
  }, [author]);

  function setField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSave) {
      await onSave(form);
    } else {
      // fallback: log the updated user
      // In a real app you'd call an API here.
      // eslint-disable-next-line no-console
      console.log("save user", form, avatarFile);
    }
  }

  const formInputs = isPublication
    ? Object.keys(formDetails).filter((key) => key !== "pen_name")
    : Object.keys(formDetails);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {formInputs.map((key) => {
          const detail = formDetails[key];
          if (!detail) return null;
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={`user-${key}`} className="text-sm sm:text-base">
                {detail.label}
              </Label>
              {detail.type === "text" || detail.type === "email" ? (
                <Input
                  id={`user-${key}`}
                  type={detail.type}
                  value={(form as any)[key] ?? ""}
                  onChange={(event) => setField(key, event.target.value)}
                  placeholder={detail.label}
                  className="text-sm sm:text-base"
                  required={key === "name" || key === "username"}
                />
              ) : detail.type === "select" ? (
                <Select
                  value={(form as any)[key] ?? detail.options?.[0]}
                  onValueChange={(v: string) => setField(key, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${detail.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {detail.options?.map((option: any) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
      </div>

      {/* Social Links */}
      {form.social_links && (
        <SocialLinks social_links={form.social_links} setField={setField} />
      )}

      {/* Awards */}
      {form.awards && <Awards awards={form.awards} setField={setField} />}
    </form>
  );
}
