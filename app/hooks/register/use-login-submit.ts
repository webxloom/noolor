"use client";

import { useToast } from "@/app/contexts/toast-context";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Username or phone is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function useLoginSubmit() {
  const supabase = createBrowserSupabaseClient();
  const { addToast } = useToast();
  const router = useRouter();

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
      // Lookup email via API
      const lookupResponse = await fetch("/api/auth/lookup-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier }),
      });

      if (!lookupResponse.ok) {
        const result = (await lookupResponse.json()) as { error?: string };
        form.setError("identifier", {
          message:
            result.error || "User not found. Please check and try again.",
        });
        return;
      }

      const { email } = (await lookupResponse.json()) as { email: string };

      // Authenticate using email
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      addToast("Welcome back ,You have successfully logged in.", "success");

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      addToast(
        "Login failed, Please check your credentials and try again.",
        "error",
      );
    }
  };

  return {
    form,
    onSubmit,
  };
}
