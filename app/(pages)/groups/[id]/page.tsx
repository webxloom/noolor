"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, Lock, Globe } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { sampleGroups } from "@/lib/sample-groups";

export default function GroupDetail() {
  const params = useParams<{ id: string }>();
  const [memberOverrides, setMemberOverrides] = useState<
    Record<string, boolean>
  >({});

  const group = useMemo(() => {
    const current = sampleGroups.find((entry) => entry.id === params.id);

    if (!current) {
      return undefined;
    }

    const isMember = memberOverrides[current.id] ?? current.isMember ?? false;

    return {
      ...current,
      isMember,
      memberCount:
        current.memberCount +
        (isMember === (current.isMember ?? false) ? 0 : isMember ? 1 : -1),
    };
  }, [memberOverrides, params.id]);

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>Group not found</p>
      </div>
    );
  }

  const groupId = group.id;
  const isMember = group.isMember ?? false;
  const members = group.members;

  function handleJoin() {
    setMemberOverrides((current) => ({ ...current, [groupId]: true }));
  }

  function handleLeave() {
    setMemberOverrides((current) => ({ ...current, [groupId]: false }));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="border rounded-lg p-7 bg-card mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-serif font-semibold text-foreground">
                {group.name}
              </h1>
              {group.isPrivate ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Created by {group.creatorName}
            </p>
            {group.description && (
              <p className="text-muted-foreground leading-relaxed mb-4">
                {group.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> {group.memberCount} members
              </span>
              {group.language && (
                <Badge variant="secondary">{group.language}</Badge>
              )}
            </div>
          </div>
          {isMember ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeave}
              data-testid="button-leave-group"
            >
              Leave
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleJoin}
              data-testid="button-join-group"
            >
              Join Group
            </Button>
          )}
        </div>
      </div>

      {members.length > 0 && (
        <div>
          <h2 className="text-lg font-serif font-semibold mb-4">Members</h2>
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="font-medium text-sm">{m.name}</span>
                <Badge
                  variant={m.role === "admin" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/groups">
          <Button variant="outline">Back to Groups</Button>
        </Link>
      </div>
    </div>
  );
}
