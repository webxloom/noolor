"use client";

import { useState, useEffect } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import { Button } from "../../ui/button";
import {
  createInvitation,
  updateInvitation,
} from "@/lib/db/invitations/queries";
import { useProfileSession } from "@/app/hooks/use-profile-session";
import { CardTitle } from "../../ui/card";

export type InviteFormData = {
  name: string;
  phone: string;
  email?: string;
  role: "writer" | "publication";
};

type Props = {
  initialData?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    role?: InviteFormData["role"];
  } | null;
  onAddAndInvite?: (data: InviteFormData) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function InviteForm({
  initialData = null,
  onAddAndInvite,
  onSuccess,
  onCancel,
}: Props) {
  const { profileUser } = useProfileSession();
  const [form, setForm] = useState<InviteFormData>({
    name: "",
    phone: "",
    email: "",
    role: "writer",
  });
  const [updateMessage, setUpdateMessage] = useState<Record<string, string>>(
    {},
  );

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    // basic phone validation (digits, +, -, spaces)
    if (form.phone && !/^\+?[0-9 \-]+$/.test(form.phone))
      e.phone = "Invalid phone format";
    if (!form.role) e.role = "Role is required";
    const displayErrors = Object.values(e).join(", ");
    if (displayErrors) {
      setUpdateMessage({ error: displayErrors });
    }
    return Object.keys(e).length === 0;
  }

  function handleChange<K extends keyof InviteFormData>(
    key: K,
    value: InviteFormData[K],
  ) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        phone: initialData.phone ?? "",
        email: initialData.email ?? "",
        role: initialData.role ?? "writer",
      });
    }
  }, [initialData]);

  const onAdd = async (data: InviteFormData) => {
    const payload = {
      role: data.role,
      name: data.name,
      phone: data.phone,
      email: data.email,
      is_verified: profileUser?.role === "admin" ? true : false,
      is_invited: false,
      created_by: profileUser?.id,
    };
    const response = await createInvitation(payload);
    return response;
  };

  const handleAdd = async () => {
    if (!validate()) return;

    try {
      if (initialData?.id) {
        const response = await updateInvitation(initialData.id, {
          role: form.role,
          name: form.name,
          phone: form.phone,
          email: form.email,
          is_verified: profileUser?.role === "admin" ? true : false,
        });
        if (response.error) throw new Error(response.error);
        setUpdateMessage({ success: "Invitation updated successfully" });
      } else {
        const payload = {
          role: form.role,
          name: form.name,
          phone: form.phone,
          email: form.email,
          is_verified: profileUser?.role === "admin" ? true : false,
          is_invited: false,
          created_by: profileUser?.id,
        };
        const response = await createInvitation(payload);
        if (response.error) throw new Error(response.error);
        setUpdateMessage({ success: "Invitation created successfully" });
      }
      setForm({ name: "", phone: "", email: "", role: "writer" });
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      setUpdateMessage({
        error: error.message || "Failed to create invitation",
      });
    }
  };

  function handleAddAndInvite() {
    if (!validate()) return;
    // If editing, update and mark invited
    (async () => {
      try {
        if (initialData?.id) {
          const resp = await updateInvitation(initialData.id, {
            role: form.role,
            name: form.name,
            phone: form.phone,
            email: form.email,
            is_invited: true,
          });
          if (resp.error) throw new Error(resp.error);
          setUpdateMessage({ success: "Invitation updated and invited" });
        } else {
          onAddAndInvite?.(form);
        }
        setForm({ name: "", phone: "", email: "", role: "writer" });
        onSuccess?.();
      } catch (err: any) {
        setUpdateMessage({ error: err.message || "Failed to invite" });
      }
    })();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="font-serif text-2xl">{"Add Invite"}</CardTitle>
        </div>
      </div>

      <div className="space-y-5">
        {updateMessage.error && (
          <div className="text-sm text-red-600">{updateMessage.error}</div>
        )}
        {updateMessage.success && (
          <div className="text-sm text-green-600">{updateMessage.success}</div>
        )}

        <form
          onSubmit={(e) => e.preventDefault()}
          className="invite-form space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="invitee-name">Name</Label>
            <Input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invitee-phone">Phone</Label>
            <Input
              id="phone"
              type="text"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invitee-email">Email(optional)</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-role">Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) =>
                handleChange("role", value as InviteFormData["role"])
              }
            >
              <SelectTrigger id="event-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="writer">Writer</SelectItem>
                <SelectItem value="publication">Publication</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" onClick={handleAdd}>
              {initialData?.id ? "Save" : "Add User"}
            </Button>
            <Button type="button" onClick={handleAddAndInvite}>
              {initialData?.id ? "Save & Invite" : "Add & Invite"}
            </Button>
            {onCancel ? (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
