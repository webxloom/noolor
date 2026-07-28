import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getProfileByIdQuery,
  ProfileRecord,
  ProfileRole,
} from "@/lib/db/profiles/profile-queries";

function mapProfileToDashboardUser(
  profile: Partial<ProfileRecord>,
): DashboardUser {
  return {
    avatar_url: profile.avatar_url ?? undefined,
    id: profile.id ?? "",
    subscription_plan: profile.subscription_plan ?? undefined,
    name: profile.name ?? "",
    username: profile.username ?? undefined,
    phone: profile.phone ?? undefined,
    contact_email: profile.contact_email ?? undefined,
    role: (profile.role as ProfileRole) ?? "reader",
    other_roles: (profile.other_roles as string[]) ?? [],
  };
}

export type DashboardUser = {
  avatar_url?: string;
  id: string;
  subscription_plan?: string;
  name: string;
  username?: string;
  phone?: string;
  contact_email?: string;
  role: ProfileRole; // Add the role property to the DashboardUser type
  other_roles?: string[]; // Optional property for other roles
};

export function useProfileSession() {
  const [profileUser, setProfileUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentSessionUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    async function syncDashboardUser(session: Session | null) {
      if (!isMounted) {
        return;
      }

      currentSessionUserIdRef.current = session?.user?.id ?? null;

      if (!session?.user?.id) {
        setProfileUser(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await getProfileByIdQuery(
        supabase,
        session.user.id,
      );

      if (!isMounted) {
        return;
      }

      if (error || !data) {
        setProfileUser(null);
      } else {
        setProfileUser(mapProfileToDashboardUser(data));
      }

      setIsLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => {
      void syncDashboardUser(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;

      if (nextUserId === currentSessionUserIdRef.current) {
        return;
      }

      setIsLoading(true);
      void syncDashboardUser(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { profileUser, isLoading };
}
