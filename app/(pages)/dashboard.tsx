import { useGetCurrentUser, useListBooks, useListBlogs, useListGroups, useGetPlatformStats, getGetCurrentUserQueryKey, getGetPlatformStatsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { BookOpen, FileText, Users, Star, Plus, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats } = useGetPlatformStats({
    query: { queryKey: getGetPlatformStatsQueryKey() }
  });

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-24 rounded-lg" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-serif font-semibold mb-2">Sign in to access your dashboard</h2>
        <p className="text-muted-foreground mb-6">Track your books, blogs, and groups in one place</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login"><Button>Log in</Button></Link>
          <Link href="/register"><Button variant="outline">Register</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground">Welcome, {user.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="capitalize">{user.role}</Badge>
          {user.isPremium && <Badge className="bg-amber-100 text-amber-700 border-0">Premium</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats && [
          { label: "Authors", value: stats.totalAuthors, icon: User, href: "/authors" },
          { label: "Books", value: stats.totalBooks, icon: BookOpen, href: "/books" },
          { label: "Blogs", value: stats.totalBlogs, icon: FileText, href: "/blogs" },
          { label: "Groups", value: stats.totalGroups, icon: Users, href: "/groups" },
        ].map(item => (
          <Link key={item.label} href={item.href}>
            <div className="border rounded-lg p-4 bg-card hover:border-primary/40 transition-all cursor-pointer text-center">
              <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {(user.role === "writer" || user.role === "publication") && (
          <section className="border rounded-lg p-5 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-foreground">Your Books</h2>
              <Link href="/books">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Manage your book listings</p>
            <Link href="/books">
              <Button size="sm" className="w-full gap-2">
                <Plus className="h-4 w-4" /> Add a Book
              </Button>
            </Link>
          </section>
        )}

        <section className="border rounded-lg p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-foreground">Your Blogs</h2>
            <Link href="/blogs">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {user.role === "reader" && !user.isPremium
              ? "Upgrade to Premium to write blogs"
              : "Share your thoughts with the community"}
          </p>
          {(user.role !== "reader" || user.isPremium) && (
            <Link href="/blogs/new">
              <Button size="sm" className="w-full gap-2">
                <Plus className="h-4 w-4" /> Write a Blog
              </Button>
            </Link>
          )}
        </section>

        <section className="border rounded-lg p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-foreground">Groups</h2>
            <Link href="/groups">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Explore <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mb-3">Connect with writers and readers</p>
          <div className="flex gap-2">
            <Link href="/groups/new" className="flex-1">
              <Button size="sm" variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" /> Create Group
              </Button>
            </Link>
            <Link href="/groups" className="flex-1">
              <Button size="sm" className="w-full">Browse</Button>
            </Link>
          </div>
        </section>

        <section className="border rounded-lg p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-foreground">Explore</h2>
          </div>
          <div className="space-y-2">
            <Link href="/authors"><div className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1"><User className="h-4 w-4" /> Browse authors</div></Link>
            <Link href="/books?isFree=true"><div className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1"><BookOpen className="h-4 w-4" /> Free e-books</div></Link>
            <Link href="/publications"><div className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1"><Star className="h-4 w-4" /> Publishers</div></Link>
          </div>
        </section>
      </div>
    </div>
  );
}
