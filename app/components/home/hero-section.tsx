import Link from "next/link";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const words = ["books", "events   ", "authors"];
  const fullText = words[currentWordIndex];

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setCurrentIndex(0);
        setDisplayedText("");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, fullText, words]);

  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden bg-primary/5">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')] bg-cover bg-center opacity-[0.2] mix-blend-multiply pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center max-w-4xl">
        <Badge className="mb-6 py-1.5 text-base bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
          A Home for Regional & Multilingual Literature
        </Badge>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold uppercase text-foreground mb-6 leading-[1.1]">
          Discover <br className="hidden md:block" />
          <span className="text-primary inline-block min-h-[1em] text-5xl">
            {displayedText}
            <span
              className={`ml-2 ${showCursor ? "opacity-100" : "opacity-0"}`}
            >
              ...
            </span>
          </span>
        </h1>
        <p className="text-lg md:text-3xl text-foreground mb-10 max-w-2xl leading-relaxed">
          ✦ Every Writer. A Page of Their Own. ✦
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="px-8 py-4 bg-primary text-white rounded-full text-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Join Now
          </Link>
        </div>

        {/* <form
          onSubmit={handleSearch}
          className="w-full max-w-xl flex gap-2 relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for books, authors, or publications..."
            className="h-14 pl-12 pr-4 rounded-full bg-background border-border shadow-sm text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="submit"
            className="h-14 rounded-full px-8 absolute right-1 top-1/2 -translate-y-1/2"
            size="lg"
          >
            Search
          </Button>
        </form> */}

        {/* <div className="mt-8 flex gap-4 text-sm font-medium text-muted-foreground">
          <span>Popular:</span>
          <Link
            href="/search?q=poetry"
            className="hover:text-primary transition-colors"
          >
            Poetry
          </Link>
          <Link
            href="/search?q=history"
            className="hover:text-primary transition-colors"
          >
            History
          </Link>
          <Link
            href="/search?q=fiction"
            className="hover:text-primary transition-colors"
          >
            Fiction
          </Link>
        </div> */}
      </div>
    </section>
  );
}
