import { BookCard } from "@/app/components/books/book-card";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

const featuredBooks = [
  {
    id: "1",
    title: "Ponniyin Selvan",
    authorName: "Kalki Krishnamurthy",
    coverUrl: "",
    isFree: false,
    language: "Tamil",
    genre: "Historical Fiction",
    rating: 4.8,
    reviewCount: 234,
    price: 299,
  },
  {
    id: "2",
    title: "Silappatikaram",
    authorName: "Ilango Adigal",
    coverUrl: "",
    isFree: true,
    language: "Tamil",
    genre: "Epic",
    rating: 4.9,
    reviewCount: 156,
  },
  {
    id: "3",
    title: "Manimekalai",
    authorName: "Chithalai Chathanar",
    coverUrl: "",
    isFree: true,
    language: "Tamil",
    genre: "Epic",
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: "4",
    title: "Tirukkural",
    authorName: "Thiruvalluvar",
    coverUrl: "",
    isFree: true,
    language: "Tamil",
    genre: "Philosophy",
    rating: 4.9,
    reviewCount: 512,
  },
  {
    id: "5",
    title: "Kamba Ramayanam",
    authorName: "Kambar",
    coverUrl: "",
    isFree: false,
    language: "Tamil",
    genre: "Epic",
    rating: 4.8,
    reviewCount: 201,
    price: 399,
  },
];

export default function FeaturedBooks({
  setLocation,
  isLoadingFeatured,
}: {
  setLocation: (path: string) => void;
  isLoadingFeatured: boolean;
}) {
  return (
    <section className="py-16 md:py-24 bg-accent/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-2">
              New & Notable
            </h2>
            <p className="text-muted-foreground">
              Curated selections from our library
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:flex group"
            onClick={() => setLocation("/books")}
          >
            View all{" "}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {isLoadingFeatured
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            : featuredBooks
                ?.slice(0, 5)
                .map((book) => <BookCard key={book.id} book={book} />)}
        </div>
        <Button
          variant="outline"
          className="w-full mt-8 sm:hidden"
          onClick={() => setLocation("/books")}
        >
          View all books
        </Button>
      </div>
    </section>
  );
}
