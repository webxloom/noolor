"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ui/button";
import { SupportedLanguage } from "@/app/components/layout/navbar";
import enMessages from "@/language-messages/en.json";
import taMessages from "@/language-messages/ta.json";

export function HeroSection() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const messages =
    language === "en" ? enMessages["hero-section"] : taMessages["hero-section"];

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("preferredLanguage");

    if (storedLanguage === "en" || storedLanguage === "ta") {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    const words = messages.subHeadline;
    const currentWord = words[wordIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayed(currentWord.substring(0, displayed.length + 1));

          if (displayed === currentWord) {
            setTimeout(() => setIsDeleting(true), 1200);
          }
        } else {
          setDisplayed(currentWord.substring(0, displayed.length - 1));

          if (displayed === "") {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? 50 : 100,
    );

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex, messages]);

  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden bg-primary/5">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')] bg-cover bg-center opacity-[0.08] mix-blend-multiply pointer-events-none" />

      <div className="container relative mx-auto px-4 md:px-6 z-10">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content (3/5 width) */}
          <div className="lg:col-span-3 flex flex-col space-y-6 md:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto lg:mx-0">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {messages.badge}
              </span>
            </div>

            {/* Tamil Headline */}
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
              <span className="block text-primary mb-2">
                {messages.headline}
              </span>
              <span className="text-primary/80 text-5xl">
                {displayed}
                <span className="animate-pulse">|</span>
              </span>
            </h1>

            {/* English Translation */}
            <p className="text-lg md:text-2xl lg:text-3xl text-foreground font-medium italic">
              {messages.tagline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link href="/books">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base font-semibold shadow-lg hover:shadow-xl"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  {messages.cta1}
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base font-semibold border-2 hover:bg-primary/5"
                >
                  {messages.cta2}
                </Button>
              </Link>
            </div>

            {/* Stats/Trust Indicators */}
            <div className="flex flex-wrap gap-6 md:gap-8 justify-center lg:justify-start pt-2">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary font-serif">
                  500+
                </div>
                <div className="text-sm text-muted-foreground">
                  {messages.countBooks}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary font-serif">
                  100+
                </div>
                <div className="text-sm text-muted-foreground">
                  {messages.countWriters}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary font-serif">
                  10k+
                </div>
                <div className="text-sm text-muted-foreground">
                  {messages.countReaders}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="relative mx-auto w-full h-[320px] sm:h-[420px] lg:h-[520px] xl:h-[620px] rounded-3xl overflow-hidden">
              <Image
                src="/images/home-image.png"
                alt="hand with books"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary/8 via-primary/4 to-transparent pointer-events-none" />
    </section>
  );
}
