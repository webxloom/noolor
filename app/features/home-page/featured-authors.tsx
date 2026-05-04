import { AuthorCard } from "@/app/components/shared/author-card";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

const featuredAuthors = [
  {
    id: "1",
    name: "Kalki Krishnamurthy",
    avatarUrl: "",
    location: "Chennai",
    bookCount: 45,
    reviewCount: 2340,
    languages: ["Tamil"],
  },
  {
    id: "2",
    name: "Ilango Adigal",
    avatarUrl: "",
    location: "Tamil Nadu",
    bookCount: 12,
    reviewCount: 1850,
    languages: ["Tamil"],
  },
  {
    id: "3",
    name: "Chithalai Chathanar",
    avatarUrl: "",
    location: "Madurai",
    bookCount: 28,
    reviewCount: 1620,
    languages: ["Tamil", "Sanskrit"],
  },
  {
    id: "4",
    name: "Thiruvalluvar",
    avatarUrl: "",
    location: "Tamil Nadu",
    bookCount: 5,
    reviewCount: 3200,
    languages: ["Tamil"],
  },
];

export default function FeaturedAuthors({
  setLocation,
  isLoadingFeatured,
}: {
  setLocation: (path: string) => void;
  isLoadingFeatured: boolean;
}) {
  return (
    <section className="py-16 md:py-24 border-y">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-2">
              Voices of Noolor
            </h2>
            <p className="text-muted-foreground">
              Discover brilliant writers and their stories
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:flex group"
            onClick={() => setLocation("/authors")}
          >
            View all{" "}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingFeatured
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] rounded-xl" />
              ))
            : featuredAuthors
                ?.slice(0, 4)
                .map((author) => (
                  <AuthorCard key={author.id} author={author} />
                ))}
        </div>
        <Button
          variant="outline"
          className="w-full mt-8 sm:hidden"
          onClick={() => setLocation("/authors")}
        >
          View all authors
        </Button>
      </div>
    </section>
  );
}
