import { BookOpen, FileUser, PenSquare, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";

const dashboardFeatures = [
  {
    icon: FileUser,
    title: "Profile setup",
    text: "Create the author profile with bio, languages, genres, awards, upcoming works, and social links.",
  },
  {
    icon: BookOpen,
    title: "Book management",
    text: "Add books, upload covers and reading files, manage pricing, and maintain the existing catalog.",
  },
  {
    icon: PenSquare,
    title: "Blog publishing",
    text: "Draft blogs, upload a cover image, add tags, and control publish or schedule status from one editor.",
  },
];

const quickStartSteps = [
  {
    title: "1. Complete your profile first",
    detail:
      "Use the Profile section to save your about details, links, awards, and upcoming works. Books depend on this author record.",
  },
  {
    title: "2. Build your book catalog",
    detail:
      "Open Books to switch between the existing catalog and the editor. Add metadata, upload assets, set pricing, and save drafts or published entries.",
  },
  {
    title: "3. Publish essays and updates",
    detail:
      "Open Blogs to manage existing posts or create a new one. Add details, content, tags, a cover image, and publish immediately or schedule later.",
  },
];

const sectionGuide = [
  {
    name: "Overview",
    helper: "A quick map of what the dashboard supports right now.",
  },
  {
    name: "Profile",
    helper:
      "Contains About, Social Media & Links, and Awards & Works tabs for your public author presence.",
  },
  {
    name: "Books",
    helper:
      "Includes an Existing books catalog with filters plus an editor for details, assets, quotes, and pricing.",
  },
  {
    name: "Blogs",
    helper:
      "Includes an Existing blogs catalog plus an editor for details, content, and publishing controls.",
  },
];

export default function AuthorOverview() {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardFeatures.map((item) => (
          <Card key={item.title} className="border-border/70 shadow-sm">
            <CardHeader>
              <item.icon className="h-5 w-5 text-primary" />
              <CardTitle className="pt-3 text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {item.text}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <div>
              <CardTitle className="font-serif text-2xl">
                How To Use The Dashboard
              </CardTitle>
              <CardDescription>
                The current workflow is simple: set up the author profile, then
                manage books and blogs from their dedicated sections.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickStartSteps.map((entry) => (
              <div
                key={entry.title}
                className="rounded-2xl border bg-muted/20 p-4"
              >
                <div className="space-y-2">
                  <div>
                    <p className="font-medium text-foreground">{entry.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {entry.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              Available Sections
            </CardTitle>
            <CardDescription>
              Each section is focused on a specific part of the author workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionGuide.map((section) => (
              <div
                key={section.name}
                className="rounded-2xl border bg-background p-4"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{section.name}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {section.helper}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
