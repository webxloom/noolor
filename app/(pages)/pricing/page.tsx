import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { plans, roles, faqs } from "@/lib/constants/pricing";
import {
  Check,
  X,
  BookOpen,
  PenLine,
  GraduationCap,
  Building2,
} from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground">
            Choose Your Journey on Noolor
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Whether you&apos;re discovering books, sharing your writing,
            publishing literary works, or preserving language and culture,
            Noolor has a plan designed for you.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`
                relative flex flex-col
                ${
                  plan.highlighted
                    ? "border-primary border-2 shadow-xl lg:scale-105 lg:-translate-y-4 bg-card"
                    : "border-border shadow-md hover:shadow-lg"
                }
                transition-all duration-300 hover:shadow-xl
                rounded-2xl overflow-hidden
              `}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={plan.highlighted ? "default" : "secondary"}
                    className="font-medium px-3 py-1"
                  >
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-4 pb-6">
                <CardTitle className="text-2xl font-serif">
                  {plan.name}
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed min-h-[3rem]">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                {plan.features.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    {section.role && (
                      <h4
                        className={`
                        font-semibold text-sm
                        ${
                          section.role.includes("Limitations")
                            ? "text-muted-foreground"
                            : section.role.includes("Everything")
                              ? "text-primary font-medium"
                              : "text-foreground"
                        }
                      `}
                      >
                        {section.role}
                      </h4>
                    )}
                    <ul className="space-y-2.5">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3">
                          {item.included ? (
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`
                            text-sm leading-relaxed
                            ${item.included ? "text-foreground" : "text-muted-foreground"}
                          `}
                          >
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-6 pb-8">
                <Button
                  variant={plan.ctaVariant}
                  size="lg"
                  className={`
                    w-full font-medium text-base
                    ${plan.highlighted ? "shadow-md hover:shadow-lg" : ""}
                  `}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Cancel Anytime Message */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans can be canceled anytime. No hidden fees.
        </p>
      </section>

      {/* One Account, Multiple Roles Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <Card className="border-2 border-border bg-card/50 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-3xl md:text-4xl font-serif">
                One Account, Multiple Roles
              </CardTitle>
              <CardDescription className="text-base md:text-lg">
                With a single Noolor account you can become:
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {roles.map((role) => (
                  <div
                    key={role.name}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    <div className="p-3 rounded-lg bg-primary/10">
                      <role.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-foreground">
                        {role.name}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center space-y-3 p-6 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-base text-foreground font-medium">
                  Activate new roles anytime without creating another account.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You don&apos;t pay for roles — you pay for plans. Your
                  subscription unlocks additional benefits, visibility,
                  analytics, and publishing limits across all your roles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ-style explanation */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-foreground">
                  <span>{faq.question}</span>
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
