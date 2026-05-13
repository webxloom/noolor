"use client";

import Link from "next/link";
import { UserPlus, Upload, Users, Award } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";

const STEPS = [
  {
    number: "1",
    icon: UserPlus,
    title: "Create your profile",
    description: "Sign up and set up your author profile in minutes",
  },
  {
    number: "2",
    icon: Upload,
    title: "Upload your books",
    description: "Share your Tamil literary works with the community",
  },
  {
    number: "3",
    icon: Users,
    title: "Reach readers",
    description: "Connect with passionate readers who love Tamil literature",
  },
  {
    number: "4",
    icon: Award,
    title: "Build your literary identity",
    description: "Establish your presence in the Tamil literary world",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your journey as a Tamil writer in four simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.number}
                className="relative p-6 text-center hover-elevate transition-all duration-300 group"
              >
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-8 w-8 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/register">
            <Button size="lg" className="text-base font-semibold shadow-lg">
              Get Started Today
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Join our growing community of Tamil writers
          </p>
        </div>
      </div>
    </section>
  );
}
