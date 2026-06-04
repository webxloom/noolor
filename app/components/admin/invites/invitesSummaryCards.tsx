"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Newspaper } from "lucide-react";
import UserSummaryCard from "../users/userSummaryCard";

export default function InvitesSummaryCards() {
  const [counts, setCounts] = useState({
    total: 0,
    invited: 0,
    verified: 0,
    admin: 0,
    others: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCounts() {
      try {
        const supabase = createBrowserSupabaseClient();

        const { data: totalRes, error } = await supabase
          .from("invitations")
          .select(
            `
          is_verified,
          is_invited,
          creator:profiles!invitations_created_by_fkey(role)
          `,
            { count: "exact" },
          );

        if (error) {
          console.error("Error fetching blogs:", error);
          return;
        }

        type InvitationRow = {
          is_verified?: boolean;
          is_invited?: boolean;
          creator?: Array<{ role?: string }> | { role?: string } | null;
        };

        const allCounts: Record<string, number> = {};

        const rows = totalRes as InvitationRow[] | undefined;

        rows?.forEach((invitation) => {
          const role = Array.isArray(invitation.creator)
            ? invitation.creator[0]?.role || "others"
            : (invitation.creator as { role?: string } | undefined)?.role ||
              "others";
          allCounts[role] = (allCounts[role] || 0) + 1;
        });

        if (!mounted) return;

        setCounts({
          total: totalRes?.length ?? 0,
          invited: totalRes?.filter((inv) => inv.is_invited).length ?? 0,
          verified: totalRes?.filter((inv) => inv.is_verified).length ?? 0,
          admin: allCounts["admin"] || 0,
          others: allCounts["others"] || 0,
        });
      } catch (e) {
        console.error("Failed to fetch user summary counts", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchCounts();

    return () => {
      mounted = false;
    };
  }, []);

  const items = [
    {
      title: "Total Invites",
      value: counts.total,
      icon: Newspaper,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Users Invited",
      value: counts.invited,
      icon: Newspaper,
      color: "bg-violet-100 text-violet-600",
    },
    {
      title: "Users Verified",
      value: counts.verified,
      icon: Newspaper,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Created by Admin",
      value: counts.admin,
      icon: Newspaper,
      color: "bg-violet-100 text-violet-600",
    },
    {
      title: "Created by Others",
      value: counts.others,
      icon: Newspaper,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <section aria-labelledby="users-summary" className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {items.map((it) => (
          <UserSummaryCard
            key={it.title}
            title={it.title}
            value={loading ? "..." : it.value}
            icon={it.icon}
            color={it.color}
          />
        ))}
      </div>
    </section>
  );
}
