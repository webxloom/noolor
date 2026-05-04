import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { User, Mail, Globe, Star } from "lucide-react";

export default function Profile() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-serif font-semibold mb-2">Not signed in</h2>
        <div className="flex gap-3 justify-center mt-4">
          <Link href="/login"><Button>Log in</Button></Link>
          <Link href="/register"><Button variant="outline">Register</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="border rounded-lg p-8 bg-card">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-semibold text-foreground mb-1">{user.name}</h1>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="secondary" className="capitalize">{user.role}</Badge>
              {user.isPremium && <Badge className="bg-amber-100 text-amber-700 border-0 flex items-center gap-1"><Star className="h-3 w-3" /> Premium</Badge>}
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</p>
              {user.language && <p className="flex items-center gap-2"><Globe className="h-4 w-4" /> {user.language}</p>}
              <p className="text-xs mt-2">Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {user.role === "writer" && (
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-medium mb-2">Writer Profile</h3>
            <p className="text-sm text-muted-foreground mb-3">
              You have a dedicated author page where visitors can discover your work.
            </p>
            <Link href="/authors">
              <Button variant="outline" size="sm">View Author Directory</Button>
            </Link>
          </div>
        )}
        {user.role === "publication" && (
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-medium mb-2">Publication Profile</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your publication page showcases your catalog to readers.
            </p>
            <Link href="/publications">
              <Button variant="outline" size="sm">View Publications Directory</Button>
            </Link>
          </div>
        )}

        {!user.isPremium && (
          <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
            <h3 className="font-medium text-amber-800 mb-1">Upgrade to Premium</h3>
            <p className="text-sm text-amber-700">
              Unlock unlimited books, blog posts, and private groups.
            </p>
          </div>
        )}

        <Button
          variant="outline"
          onClick={logout}
          data-testid="button-logout"
          className="w-full mt-4"
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
