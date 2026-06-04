import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
