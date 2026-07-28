"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  PenTool,
  Menu,
  X,
  Newspaper,
  Globe,
  BadgeIndianRupee,
  Calendar,
  Library,
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
import { useProfileSession } from "@/app/hooks/use-profile-session";
import enMessages from "@/language-messages/en.json";
import taMessages from "@/language-messages/ta.json";

export type SupportedLanguage = "en" | "ta";

function NavLinks({ messages }: { messages: (typeof enMessages)["navbar"] }) {
  return (
    <>
      <Link
        href="/books"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <BookOpen className="h-4 w-4" /> {messages.books}
      </Link>
      <Link
        href="/authors"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <PenTool className="h-4 w-4" /> {messages.authors}
      </Link>
      <Link
        href="/blogs"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <Newspaper className="h-4 w-4" /> {messages.blogs}
      </Link>
      <Link
        href="/events"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" /> {messages.events}
      </Link>
      <Link
        href="/publications"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <Library className="h-4 w-4" /> Publications
      </Link>
      {/* <Link
        href="/groups"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <Users className="h-4 w-4" /> Groups
      </Link> */}
      <Link
        href="/pricing"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <BadgeIndianRupee className="h-4 w-4" /> {messages.pricing}
      </Link>
    </>
  );
}

export function Navbar() {
  const router = useRouter();
  const { profileUser, isLoading } = useProfileSession();
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const messages = language === "en" ? enMessages.navbar : taMessages.navbar;

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("preferredLanguage");

    if (storedLanguage === "en" || storedLanguage === "ta") {
      setLanguage(storedLanguage);
    }
  }, []);

  const isAuthenticated = !!profileUser;

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
    router.push("/login");
    router.refresh();
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <details className="group relative md:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <Menu className="h-5 w-5 group-open:hidden" />
              <X className="hidden h-5 w-5 group-open:block" />
              <span className="sr-only">{messages.toggleMenu}</span>
            </summary>
            <div className="absolute left-0 top-[calc(100%+0.75rem)] w-[300px] rounded-xl border bg-background p-6 shadow-lg">
              <div className="flex flex-col gap-6">
                <NavLinks messages={messages} />
              </div>
            </div>
          </details>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-primary">
              {messages.brand}
            </span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <NavLinks messages={messages} />
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
                  {language === "en"
                    ? messages.language
                    : messages.languageTamil}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleLanguageChange("en")}
                className={`cursor-pointer ${language === "en" ? "bg-accent" : ""}`}
              >
                <span className="mr-2">🇬🇧</span> English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange("ta")}
                className={`cursor-pointer ${language === "ta" ? "bg-accent" : ""}`}
              >
                <span className="mr-2">🇮🇳</span> தமிழ் (Tamil)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : (
            <>
              {isAuthenticated && profileUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        {profileUser.avatar_url && (
                          <AvatarImage
                            src={profileUser.avatar_url || undefined}
                            alt={profileUser.name}
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(profileUser.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{profileUser.name}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard")}
                      className="cursor-pointer hover:bg-accent/50 transition-colors flex items-center gap-2"
                    >
                      {messages.dashboard}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:bg-destructive/10 cursor-pointer hover:bg-destructive/10 transition-colors flex items-center gap-2"
                    >
                      {messages.logOut}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login")}
                    className="hidden sm:flex cursor-pointer"
                  >
                    {messages.logIn}
                  </Button>
                  <Button
                    className="cursor-pointer"
                    onClick={() => router.push("/register")}
                  >
                    {messages.signUp}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
