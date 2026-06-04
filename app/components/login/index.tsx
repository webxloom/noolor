import { BookOpen } from "lucide-react";
import LoginForm from "./login-form";
import Link from "next/link";
import { useLoginSubmit } from "@/app/hooks/register/use-login-submit";

export default function Login() {
  const { form, onSubmit } = useLoginSubmit();

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
          <LoginForm form={form} onSubmit={onSubmit} />
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
