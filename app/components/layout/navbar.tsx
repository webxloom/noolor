"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  BookOpen,
  PenTool,
  Library,
  Users,
  Menu,
  X,
  Newspaper,
  Globe,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { mapSessionUser, type SessionUser } from "@/lib/supabase/session-user";

function NavLinks() {
  return (
    <>
      <Link
        href="/search"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <Search className="h-4 w-4" /> Explore
      </Link>
      <Link
        href="/books"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <BookOpen className="h-4 w-4" /> Books
      </Link>
      <Link
        href="/authors"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <PenTool className="h-4 w-4" /> Authors
      </Link>
      <Link
        href="/blogs"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <Newspaper className="h-4 w-4" /> Blogs
      </Link>
      {/* <Link
        href="/publications"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <Library className="h-4 w-4" /> Publications
      </Link>
      <Link
        href="/groups"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <Users className="h-4 w-4" /> Groups
      </Link> */}
    </>
  );
}

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [language, setLanguage] = useState<"en" | "ta">("en");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setUser(mapSessionUser(data.session));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(mapSessionUser(session));
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!user;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();

    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <details className="group relative md:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <Menu className="h-5 w-5 group-open:hidden" />
              <X className="hidden h-5 w-5 group-open:block" />
              <span className="sr-only">Toggle navigation menu</span>
            </summary>
            <div className="absolute left-0 top-[calc(100%+0.75rem)] w-[300px] rounded-xl border bg-background p-6 shadow-lg">
              <div className="flex flex-col gap-6">
                <NavLinks />
              </div>
            </div>
          </details>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-primary">
              நூலோர்
            </span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-2"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {language === "en" ? "English" : "தமிழ்"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className={`cursor-pointer ${language === "en" ? "bg-accent" : ""}`}
              >
                <span className="mr-2">🇬🇧</span> English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("ta")}
                className={`cursor-pointer ${language === "ta" ? "bg-accent" : ""}`}
              >
                <span className="mr-2">🇮🇳</span> தமிழ் (Tamil)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    {user.avatar_url && (
                      <AvatarImage
                        src={user.avatar_url || undefined}
                        alt={user.name}
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer"
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer"
                >
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="hidden sm:flex cursor-pointer"
              >
                Log in
              </Button>
              <Button
                className="cursor-pointer"
                onClick={() => router.push("/register")}
              >
                Sign up
              </Button>
              {/* <Button onClick={() => setLocation("/register")}>Sign up</Button> */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
