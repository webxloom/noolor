import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createProfileQuery,
  type ProfileRole,
} from "@/lib/db/profiles/profile-queries";

const registerPayloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
  role: z.enum(["reader", "writer", "publication"]),
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = registerPayloadSchema.parse(body);
    const supabase = createSupabaseAdminClient();

    const { data: createdUser, error: createUserError } =
      await supabase.auth.admin.createUser({
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          name: payload.name,
          phone: payload.phone,
          role: payload.role,
          languages: ["en"],
        },
      });

    if (createUserError || !createdUser.user) {
      return NextResponse.json(
        { error: createUserError?.message ?? "Failed to create auth user." },
        { status: 400 },
      );
    }

    const { error: profileError } = await createProfileQuery(supabase, {
      id: createdUser.user.id,
      name: payload.name,
      phone: payload.phone,
      role: payload.role as ProfileRole,
      languages: ["en"],
      is_premium: false,
      avatar_url: null,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(createdUser.user.id);

      return NextResponse.json(
        { error: profileError.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Account created successfully.",
        userId: createdUser.user.id,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Invalid registration payload.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during registration.",
      },
      { status: 500 },
    );
  }
}
