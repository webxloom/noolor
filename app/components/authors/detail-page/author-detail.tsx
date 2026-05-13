import Link from "next/link";
import { DetailedAuthor } from "@/app/(pages)/authors/[slug]/page";
import { Button } from "../../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import DetailSummaryCard from "./summary-card";
import DetailAwards from "./awards";
import DetailBlogs from "./blogs";
import DetailBooks from "./books";

export default function AuthorDetail({ author }: { author: DetailedAuthor }) {
  console.log("Author detail data:", author);
  return (
    <Tabs
      defaultValue="books"
      className="grid gap-6 xl:grid-cols-[650px_minmax(0,1fr)] xl:items-start"
    >
      {/* Summary */}
      <DetailSummaryCard author={author} />

      <div className="space-y-6 pl-0 xl:pl-10">
        <TabsList className="hidden h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl border border-border/70 bg-card p-2 xl:flex">
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-6">
          <DetailBooks author={author} />
        </TabsContent>

        <TabsContent value="blogs" className="space-y-6">
          <DetailBlogs />
        </TabsContent>

        <TabsContent value="awards" className="space-y-6">
          <DetailAwards author={author} />
        </TabsContent>

        <div>
          <Link href="/authors">
            <Button variant="outline">Back to Authors</Button>
          </Link>
        </div>
      </div>
    </Tabs>
  );
}
