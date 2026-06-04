import { BookOpen, Building2, GraduationCap, PenLine } from "lucide-react";

export const plans = [
  {
    name: "Free",
    badge: "Get Started",
    price: "₹0",
    period: "year",
    description: "Perfect for readers and creators exploring Noolor.",
    highlighted: false,
    features: [
      {
        role: "Reader",
        items: [
          { text: "Discover books", included: true },
          { text: "Read free books", included: true },
          { text: "Follow authors", included: true },
          { text: "Bookmarks", included: true },
          { text: "Reviews", included: true },
          { text: "Reading lists", included: true },
        ],
      },
      {
        role: "Writer",
        items: [
          { text: "Create author profile", included: true },
          { text: "Upload up to 3 books", included: true },
          { text: "Receive order requests", included: true },
        ],
      },
      {
        role: "Scholar",
        items: [
          { text: "Create scholar profile", included: true },
          { text: "Publish up to 5 articles", included: true },
        ],
      },
      {
        role: "Publisher",
        items: [
          { text: "Create publication profile", included: true },
          { text: "Upload up to 10 books", included: true },
        ],
      },
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const,
  },
  {
    name: "Standard",
    badge: "Most Popular",
    price: "₹299",
    period: "year",
    description: "Ideal for active writers, scholars, and growing publishers.",
    highlighted: false,
    features: [
      {
        role: "Everything in Free +",
        items: [],
      },
      {
        role: "Writer",
        items: [
          { text: "Unlimited books", included: true },
          { text: "Enhanced author profile", included: true },
          { text: "Featured author eligibility", included: true },
          { text: "Featured book eligibility", included: true },
        ],
      },
      {
        role: "Scholar",
        items: [
          { text: "Unlimited articles", included: true },
          { text: "Featured article eligibility", included: true },
        ],
      },
      {
        role: "Publisher",
        items: [{ text: "Up to 50 books", included: true }],
      },
      //   {
      //     role: "Growth Features",
      //     items: [
      //       { text: "Basic analytics", included: true },
      //       { text: "Profile views", included: true },
      //       { text: "Book views", included: true },
      //       { text: "Reader engagement insights", included: true },
      //     ],
      //   },
      //   {
      //     role: "Visibility Features",
      //     items: [
      //       { text: "Higher discovery ranking", included: true },
      //       { text: "Editorial recommendation eligibility", included: true },
      //     ],
      //   },
      //   {
      //     role: "Support",
      //     items: [
      //       { text: "Priority moderation", included: true },
      //       { text: "Faster verification review", included: true },
      //     ],
      //   },
      //   {
      //     role: "Revenue",
      //     items: [{ text: "Better creator revenue share", included: true }],
      //   },
    ],
    cta: "Become a Founding Member",
    ctaVariant: "default" as const,
  },
  //   {
  //     name: "Premium",
  //     badge: "Professional",
  //     price: "₹999",
  //     period: "year",
  //     description:
  //       "For professional authors, publishers, literary organizations, and serious creators.",
  //     highlighted: false,
  //     features: [
  //       {
  //         role: "Everything in Standard +",
  //         items: [],
  //       },
  //       {
  //         role: "Advanced Analytics",
  //         items: [
  //           { text: "Audience insights", included: true },
  //           { text: "Traffic sources", included: true },
  //           { text: "Reader behavior", included: true },
  //           { text: "Growth reports", included: true },
  //         ],
  //       },
  //       {
  //         role: "Promotion",
  //         items: [
  //           { text: "Homepage spotlight eligibility", included: true },
  //           { text: "Featured category placement", included: true },
  //           { text: "Promotional campaigns", included: true },
  //         ],
  //       },
  //       {
  //         role: "Publisher Tools",
  //         items: [
  //           { text: "Unlimited books", included: true },
  //           { text: "Team management", included: true },
  //           { text: "Staff accounts", included: true },
  //         ],
  //       },
  //       {
  //         role: "Branding",
  //         items: [
  //           { text: "Premium creator badge", included: true },
  //           { text: "Advanced profile customization", included: true },
  //         ],
  //       },
  //       {
  //         role: "Support",
  //         items: [
  //           { text: "Priority support", included: true },
  //           { text: "Early access features", included: true },
  //         ],
  //       },
  //       {
  //         role: "Revenue",
  //         items: [{ text: "Highest creator revenue share", included: true }],
  //       },
  //     ],
  //     cta: "Go Premium",
  //     ctaVariant: "outline" as const,
  //   },
];

export const roles = [
  {
    icon: BookOpen,
    name: "Reader",
    description: "Discover and enjoy literary works",
  },
  {
    icon: PenLine,
    name: "Writer",
    description: "Share your creative writing",
  },
  {
    icon: GraduationCap,
    name: "Scholar",
    description: "Publish research and articles",
  },
  {
    icon: Building2,
    name: "Publisher",
    description: "Manage literary publications",
  },
];

export const faqs = [
  {
    question: "Can I switch between plans?",
    answer:
      "Yes! You can upgrade or downgrade your plan anytime. Changes take effect immediately, and billing is prorated based on your current cycle.",
  },
  {
    question: "What happens to my content if I downgrade?",
    answer:
      "Your content remains published, but you'll need to comply with the new plan's limits. For example, if you have 5 books and downgrade to Free (3 book limit), you'll need to unpublish 2 books or upgrade again.",
  },
  {
    question: "Do all my roles get the plan benefits?",
    answer:
      "Yes! When you subscribe to a plan, all your active roles (Reader, Writer, Scholar, Publisher) receive the benefits. A single Standard subscription gives you unlimited books as a Writer AND unlimited articles as a Scholar.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major Indian payment methods including UPI, credit/debit cards, net banking, and digital wallets through our secure payment gateway.",
  },
];
