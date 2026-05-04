import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "../../ui/card";

export default function DetailBlogs() {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Blogs & Essays</CardTitle>
        <CardDescription>
          Articles and essays by this author will appear here once the blogs
          table is connected to this route.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-dashed bg-card/40 py-12 text-center text-muted-foreground">
          No blogs are wired to this public detail page yet.
        </div>
      </CardContent>
    </Card>
  );
}
