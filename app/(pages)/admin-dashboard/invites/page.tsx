"use client";

import { useCallback, useEffect, useState } from "react";
import InvitesSummaryCards from "@/app/components/admin/invites/invitesSummaryCards";
import SearchAndFilter, {
  InvitesFilters,
} from "@/app/components/admin/invites/searchAndFilter";
import InviteForm from "@/app/components/admin/invites/inviteForm";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import InvitesTable from "@/app/components/admin/invites/invites-table";
import {
  getAllInvitationsQuery,
  InviteRecord,
  updateInvitation,
} from "@/lib/db/invitations/queries";

type InviteRow = InviteRecord & {
  creator?: { role?: string } | null;
};

export default function InvitesPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<InvitesFilters>({});
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<InviteRow | null>(null);
  const [openAddInviteModal, setOpenAddInviteModal] = useState(false);

  const fetchinvites = useCallback(async (q: string, f: InvitesFilters) => {
    setLoading(true);

    try {
      //   const supabase = createBrowserSupabaseClient();
      const { data, error } = await getAllInvitationsQuery(100);
      if (error) {
        console.error("Error fetching invites", error);
        setInvites([]);
        return;
      }
      const trimmedQuery = q.trim().toLowerCase();
      const filteredinvites = ((data ?? []) as InviteRow[]).filter((invite) => {
        const matchesQuery =
          !trimmedQuery ||
          invite.name?.toLowerCase().includes(trimmedQuery) ||
          invite.phone.toLowerCase().includes(trimmedQuery);
        const matchesRole =
          !f?.role || f.role === "all" || invite.role === f.role;
        const matchesStatus =
          !f?.status ||
          f.status === "all" ||
          (f.status === "verified" && invite.is_verified) ||
          (f.status === "unverified" && !invite.is_verified) ||
          (f.status === "added" && !invite.is_invited) ||
          (f.status === "invited" && invite.is_invited);
        const matchesCreatedBy =
          !f?.createdBy ||
          f.createdBy === "all" ||
          (f.createdBy === "admin" && invite.creator?.role === "admin") ||
          (f.createdBy === "others" && invite.creator?.role !== "admin");

        return matchesQuery && matchesRole && matchesStatus && matchesCreatedBy;
      });
      setInvites(filteredinvites);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchinvites(query, filters);
  }, [query, filters]);

  const handleAddInvite = () => {
    setSelectedInvite(null);
    setOpenAddInviteModal(true);
  };

  const handleInvite = async (invite?: InviteRow) => {
    if (!invite) return;
    if (!invite.email) {
      alert("Invitee has no email address");
      return;
    }

    setLoading(true);
    try {
      const link = `${location.origin}/register?invite=${invite.id}`;

      const payload = {
        to: invite.email,
        subject: `You've been invited to join Noolor as a ${invite.role}`,
        information: {
          username: invite.name || invite.email,
          role: invite.role || "writer",
          path: link,
        },
        template: "invite",
      } as any;

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // mark invitation as sent
      await updateInvitation(invite.id, { is_invited: true });

      // refresh list
      fetchinvites(query, filters);
    } catch (err) {
      console.error("Failed to send invite", err);
      alert("Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <InvitesSummaryCards />

      <SearchAndFilter
        initialQuery={query}
        initialFilters={filters}
        onSearch={(q) => setQuery(q)}
        onFiltersChange={(f) => setFilters(f)}
        handleAddInvite={handleAddInvite}
      />

      <InvitesTable
        invites={invites}
        loading={loading}
        onRowClick={(u, action) => {
          if (action === "edit") {
            setSelectedInvite(u);
            setOpenAddInviteModal(true);
          } else if (action === "view") {
            setSelectedInvite(u);
          } else if (action === "delete") {
            // todo: implement delete
            console.log("delete", u);
          } else if (action === "invite") {
            handleInvite(u);
          }
        }}
      />

      {/* Add Invite modal */}
      {openAddInviteModal ? (
        <Dialog
          open={openAddInviteModal}
          onOpenChange={(open) => {
            setOpenAddInviteModal(open);
            if (!open) setSelectedInvite(null);
          }}
          className="overflow-auto"
        >
          <DialogContent className="max-w-3xl overflow-auto">
            <InviteForm
              initialData={
                selectedInvite
                  ? {
                      id: selectedInvite.id,
                      name: selectedInvite.name,
                      phone: selectedInvite.phone,
                      email: selectedInvite.email,
                      role: selectedInvite.role as any,
                    }
                  : null
              }
              onSuccess={() => {
                setOpenAddInviteModal(false);
                setSelectedInvite(null);
                fetchinvites(query, filters);
              }}
              onCancel={() => setOpenAddInviteModal(false)}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
