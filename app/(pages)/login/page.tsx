"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { useToast } from "@/app/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { BookOpen, Mail, Phone } from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type LoginMethod = "email" | "phone";

const emailSchema = z.string().email("Please enter a valid email address");
const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]{8,15}$/, "Please enter a valid phone number");

function normalizePhoneNumber(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("+")) {
    return `+${trimmedValue.slice(1).replace(/\D/g, "")}`;
  }

  return trimmedValue.replace(/\D/g, "");
}

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const supabase = createBrowserSupabaseClient();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const identifier = data.identifier.trim();

      if (loginMethod === "email") {
        const parsedEmail = emailSchema.safeParse(identifier);

        if (!parsedEmail.success) {
          form.setError("identifier", {
            message:
              parsedEmail.error.issues[0]?.message ??
              "Please enter a valid email address",
          });
          return;
        }
      }

      if (loginMethod === "phone") {
        const normalizedPhoneNumber = normalizePhoneNumber(identifier);
        const parsedPhone = phoneSchema.safeParse(normalizedPhoneNumber);

        if (!parsedPhone.success) {
          form.setError("identifier", {
            message:
              parsedPhone.error.issues[0]?.message ??
              "Please enter a valid phone number",
          });
          return;
        }
      }

      const credentials =
        loginMethod === "email"
          ? {
              email: identifier,
              password: data.password,
            }
          : {
              phone: normalizePhoneNumber(identifier),
              password: data.password,
            };

      const { error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials and try again.",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 bg-muted/20">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold">
            Welcome back to Noolor
          </h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Login method</p>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      loginMethod === "email"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => {
                      setLoginMethod("email");
                      form.clearErrors("identifier");
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      loginMethod === "phone"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => {
                      setLoginMethod("phone");
                      form.clearErrors("identifier");
                    }}
                  >
                    <Phone className="h-4 w-4" />
                    Phone
                  </button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {loginMethod === "email" ? "Email" : "Phone"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoComplete={loginMethod === "email" ? "email" : "tel"}
                        inputMode={loginMethod === "email" ? "email" : "tel"}
                        placeholder={
                          loginMethod === "email"
                            ? "name@example.com"
                            : "+91 9876543210"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
