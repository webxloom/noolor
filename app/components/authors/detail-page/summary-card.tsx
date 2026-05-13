import { PenTool, MapPin, BookOpen, Trophy } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardContent } from "../../ui/card";
import { TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";
import { DetailedAuthor } from "@/app/(pages)/authors/[slug]/page";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export default function DetailSummaryCard({
  author,
}: {
  author: DetailedAuthor;
}) {
  return (
    <aside className="relative xl:sticky xl:top-8 xl:w-[650px]">
      <Card className="relative overflow-visible rounded-[30px] border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,239,229,0.98))] shadow-sm xl:w-full">
        <CardHeader className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4 pr-10">
            <Badge className="border-0 bg-primary/10 text-primary">
              Author Profile
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <PenTool className="h-4 w-4" />
              Follow
            </Button>
          </div>

          <div className="space-y-4 flex flex-row items-center gap-4">
            <Avatar className="h-40 w-40 border border-border/60 shadow-sm">
              {author.avatarUrl ? (
                <AvatarImage src={author.avatarUrl} alt={author.name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                {getInitials(author.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-3">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                {author.name}
              </h1>

              {author.languages.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {author.languages.slice(0, 3).map((language) => (
                    <Badge
                      key={language}
                      variant="secondary"
                      className="rounded-sm text-xs font-normal"
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6 pt-0">
          <div className="space-y-3 rounded-2xl border bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Profile Details
            </p>

            {author.location ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{author.location}</span>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              {author.genres.map((genre) => (
                <Badge key={genre} variant="outline" className="rounded-sm">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-background/80 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              About
            </p>
            <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {author.bio}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-2xl border bg-background/80 p-3">
              <BookOpen className="mb-2 h-4 w-4 text-primary" />
              <div className="text-lg font-semibold text-foreground">
                {author.bookCount}
              </div>
              <p className="text-xs font-medium text-foreground">Books</p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-3">
              <Trophy className="mb-2 h-4 w-4 text-primary" />
              <div className="text-lg font-semibold text-foreground">
                {author.awards.length}
              </div>
              <p className="text-xs font-medium text-foreground">Awards</p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-3">
              <PenTool className="mb-2 h-4 w-4 text-primary" />
              <div className="text-lg font-semibold text-foreground">
                {author.blogCount}
              </div>
              <p className="text-xs font-medium text-foreground">Blogs</p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-3">
              <BookOpen className="mb-2 h-4 w-4 text-primary" />
              <div className="text-lg font-semibold text-foreground">
                {author.upcomingWorks.length}
              </div>
              <p className="text-xs font-medium text-foreground">Upcoming</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border bg-background/70 p-4 xl:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Browse Sections
            </p>
            <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl border border-border/70 bg-card p-2">
              <TabsTrigger value="books">Books</TabsTrigger>
              <TabsTrigger value="blogs">Blogs</TabsTrigger>
              <TabsTrigger value="awards">Awards</TabsTrigger>
            </TabsList>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
