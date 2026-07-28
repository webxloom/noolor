import { DashboardUser } from "@/app/hooks/use-profile-session";
import UserImage from "./user-image";
import { Mail, Phone } from "lucide-react";
import { capitalizeFirstLetter, getRoleColor } from "@/lib/utils";

export default function BasicDetails({ user }: { user: DashboardUser }) {
  const roles = [user.role, ...(user.other_roles || [])];

  return (
    <div className="rounded-lg border bg-background/80">
      <div className="space-y-4 grid grid-cols-1">
        {/* User Image */}
        <UserImage image={user.avatar_url} canEdit={true} profileId={user.id} />

        {/* User info */}
        <div className="grid grid-cols-1 px-4 pb-4">
          <h2 className="text-lg font-semibold">{user.name}</h2>

          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-muted-foreground/80" />
              <span className="truncate">{user.contact_email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 sm:mt-0">
              <Phone className="h-4 w-4 text-muted-foreground/80" />
              <span className="truncate">{user.phone || "—"}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-col items-start gap-2">
            <span className="inline-flex items-center py-0.5 rounded-full text-xs font-medium bg-muted/10 text-muted-foreground">
              <strong>Roles: </strong>
              {roles.map((role, index) => (
                <span
                  key={index}
                  className={`${getRoleColor(role)} inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium`}
                >
                  {capitalizeFirstLetter(role)}
                </span>
              ))}
            </span>

            <span className="inline-flex items-center py-0.5 rounded-full text-xs font-medium bg-muted/10 text-muted-foreground">
              <strong>Subscription Plan: </strong>
              <span
                className={`${user.subscription_plan ? "bg-emerald-100 text-emerald-800" : "bg-muted/10 text-muted-foreground"} inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium`}
              >
                {capitalizeFirstLetter(user.subscription_plan || "Free")}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
