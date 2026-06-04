import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createProfileQuery,
  type ProfileRole,
} from "@/lib/db/profiles/profile-queries";

const registerPayloadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string(),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  username: z.string().min(6, "Username must be at least 6 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  is_verified: z.boolean().optional(),
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
        password: payload.password,
        email_confirm: true,
        user_metadata: {
          name: payload.name,
          phone: payload.phone,
          username: payload.username,
          role: payload.role,
          subscription_plan: "free",
          avatar_url: null,
          contact_email: payload.email,
          is_active: true,
          is_verified: payload.is_verified ?? false,
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
      contact_email: payload.email,
      phone: payload.phone,
      username: payload.username,
      role: payload.role as ProfileRole,
      subscription_plan: "free",
      avatar_url: null,
      is_active: true,
      is_verified: payload.is_verified ?? false, // Assuming you want to set this based on the payload or default to false
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(createdUser.user.id);

      return NextResponse.json(
        { error: profileError.message },
        { status: 400 },
      );
    }

    // Update the invitation record to mark it as registered if the user was created from an invitation
    await supabase
      .from("invitations")
      .update({ is_registered: true })
      .eq("phone", payload.phone);

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
