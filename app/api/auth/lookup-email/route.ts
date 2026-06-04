import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

const lookupSchema = z.object({
  identifier: z.string().min(1),
});

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function normalizePhoneNumber(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("+")) {
    return `+${trimmedValue.slice(1).replace(/\D/g, "")}`;
  }

  return trimmedValue.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = lookupSchema.parse(body);
    const supabase = createSupabaseAdminClient();

    const identifier = payload.identifier.trim();
    const isPhoneNumber = /^[\+]?[0-9]+$/.test(identifier);

    let userId: string | null = null;

    if (isPhoneNumber) {
      // Lookup by phone
      const phoneNumber = normalizePhoneNumber(identifier);
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", phoneNumber)
        .maybeSingle();

      userId = profile?.id ?? null;
    } else {
      // Lookup by username
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", identifier)
        .maybeSingle();

      userId = profile?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get auth user by ID to get the actual auth email
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userId);

    if (authError || !authUser?.user?.email) {
      return NextResponse.json(
        { error: "Auth email not found for this user" },
        { status: 404 },
      );
    }

    return NextResponse.json({ email: authUser.user.email }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
