"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { BookOpen, Star, Sparkles, Quote } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden bg-primary/5">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')] bg-cover bg-center opacity-[0.08] mix-blend-multiply pointer-events-none" />

      {/* Decorative Quote Marks */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-4 md:left-10 text-primary/20 text-6xl md:text-9xl font-serif">
          "
        </div>
        <div className="absolute bottom-10 right-4 md:right-10 text-primary/20 text-6xl md:text-9xl font-serif">
          "
        </div>
      </div>

      <div className="container relative mx-auto px-4 md:px-6 z-10">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content (3/5 width) */}
          <div className="lg:col-span-3 flex flex-col space-y-6 md:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto lg:mx-0">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Tamil Literary Platform
              </span>
            </div>

            {/* Tamil Headline */}
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
              <span className="block text-primary mb-2">
                ஒவ்வொரு எழுத்தாளருக்கும்
              </span>
              <span className="block">ஒரு அடையாளம் தேவை</span>
            </h1>

            {/* English Translation */}
            <p className="text-lg md:text-2xl lg:text-3xl text-foreground font-medium">
              ✦ Every Writer. A Page of Their Own. ✦
            </p>

            {/* Platform Description */}
            <p className="text-base md:text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A dedicated platform celebrating Tamil literature and its
              creators. Discover exceptional books, connect with passionate
              authors, and be part of a vibrant literary community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link href="/books">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base font-semibold shadow-lg hover:shadow-xl"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Books
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base font-semibold border-2 hover:bg-primary/5"
                >
                  Become a Writer
                </Button>
              </Link>
            </div>

            {/* Stats/Trust Indicators */}
            <div className="flex flex-wrap gap-6 md:gap-8 justify-center lg:justify-start pt-2">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary font-serif">
                  500+
                </div>
                <div className="text-sm text-muted-foreground">Tamil Books</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary font-serif">
                  100+
                </div>
                <div className="text-sm text-muted-foreground">Authors</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary font-serif">
                  10k+
                </div>
                <div className="text-sm text-muted-foreground">Readers</div>
              </div>
            </div>
          </div>

          {/* Right Side - Circular Globe Visual (2/5 width) */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              {/* Main Globe Container */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 border-2 border-primary/20 shadow-2xl overflow-hidden">
                {/* Inner Circle Glow */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-background/80 to-primary/5 backdrop-blur-sm"></div>

                {/* Floating Book Elements Inside Globe */}

                {/* Book 1 - Top */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 md:w-24 z-10">
                  <Card className="overflow-hidden shadow-lg hover-elevate transition-all duration-300">
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-primary/30 to-accent/20">
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                        <BookOpen className="h-8 w-8 text-primary/50 mb-1" />
                        <p className="text-xs font-serif font-bold text-foreground">
                          காவியம்
                        </p>
                      </div>
                      <Badge className="absolute top-1 right-1 bg-primary text-[8px] px-1.5 py-0.5">
                        New
                      </Badge>
                    </div>
                  </Card>
                </div>

                {/* Author Avatar - Left */}
                <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-8 z-10">
                  <div className="relative group">
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40 flex items-center justify-center shadow-lg hover-elevate transition-all duration-300">
                      <span className="text-xl md:text-2xl font-serif font-bold text-primary">
                        க
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-background"></div>
                  </div>
                </div>

                {/* Quote Element - Right */}
                <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-6 w-24 md:w-28 z-10">
                  <Card className="p-2 md:p-3 shadow-md hover-elevate transition-all duration-300 bg-accent/30 backdrop-blur-sm">
                    <Quote className="h-4 w-4 text-primary/40 mb-1" />
                    <p className="text-[10px] font-serif italic text-foreground/80 leading-tight">
                      எழுத்து மனதின் கண்ணாடி
                    </p>
                  </Card>
                </div>

                {/* Small Book - Bottom Left */}
                <div className="absolute bottom-12 left-8 md:left-12 w-16 md:w-20 z-10">
                  <Card className="overflow-hidden shadow-md hover-elevate transition-all duration-300">
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-accent/30 to-secondary/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-xs font-serif font-bold text-foreground text-center px-1">
                          கதை
                        </p>
                      </div>
                      <Badge className="absolute top-1 left-1 bg-green-600 text-white text-[8px] px-1 py-0">
                        Free
                      </Badge>
                    </div>
                  </Card>
                </div>

                {/* Rating Star - Bottom Right */}
                <div className="absolute bottom-16 right-10 md:right-14 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 shadow-md hover-elevate transition-all duration-300">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-foreground">
                      4.8
                    </span>
                  </div>
                </div>

                {/* Author Badge - Bottom Center */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary/90 text-primary-foreground text-xs px-3 py-1 shadow-md hover-elevate transition-all duration-300">
                    100+ Authors
                  </Badge>
                </div>

                {/* Decorative Sparkles */}
                <div className="absolute top-16 right-12 opacity-40 animate-pulse z-5">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div
                  className="absolute bottom-20 left-16 opacity-40 animate-pulse z-5"
                  style={{ animationDelay: "1s" }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Outer Glow Ring */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary/8 via-primary/4 to-transparent pointer-events-none" />
    </section>
  );
}
