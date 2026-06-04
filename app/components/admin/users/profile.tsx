"use client";

import * as React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";

type User = {
  name?: string;
  username?: string;
  phone?: string;
  contact_email?: string;
  is_active?: boolean;
  avatar_url?: string | null;
  subscription_plan?: string | null;
  role?: string | null;
  [key: string]: any;
};

const formDetails: any = {
  name: { label: "Name", type: "text" },
  username: { label: "Username", type: "text" },
  phone: { label: "Phone", type: "text" },
  contact_email: { label: "Contact Email", type: "email" },
  is_active: { label: "Active", type: "switch" },
  roles: {
    label: "Role",
    type: "select",
    options: ["reader", "writer", "publication"],
  },
  subscription_plan: { label: "Subscription Plan", type: "text" },
  avatar_url: { label: "Avatar", type: "file" },
};

export default function UserProfile({
  user,
  onSave,
}: {
  user: User;
  onSave?: (updated: User) => Promise<void> | void;
}) {
  const [form, setForm] = React.useState<User>({
    name: "",
    username: "",
    phone: "",
    contact_email: "",
    is_active: true,
    avatar_url: null,
    subscription_plan: "",
    role: "reader",
  });
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, ...user }));
  }, [user]);

  function setField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setField("avatar_url", url);
    }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {formDetails &&
          Object.keys(formDetails).map((key) => {
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
                    value={form[key] ?? ""}
                    onChange={(event) => setField(key, event.target.value)}
                    placeholder={detail.label}
                    className="text-sm sm:text-base"
                    required={key === "name" || key === "username"}
                  />
                ) : detail.type === "switch" ? (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={!!form[key]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setField(key, e.target.checked)
                      }
                    />
                    <span className="text-sm">
                      {form[key] ? "Active" : "Inactive"}
                    </span>
                  </div>
                ) : detail.type === "select" ? (
                  <Select
                    value={form[key] ?? detail.options?.[0]}
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
                ) : detail.type === "file" ? (
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      {form.avatar_url ? (
                        <AvatarImage src={form.avatar_url} alt="Avatar" />
                      ) : (
                        <AvatarFallback>?</AvatarFallback>
                      )}
                    </Avatar>
                    <Input
                      id={`user-${key}`}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="text-sm sm:text-base"
                    />
                  </div>
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
        <button
          type="button"
          onClick={() => setForm(user)}
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
